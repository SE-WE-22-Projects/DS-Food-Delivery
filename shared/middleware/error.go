package middleware

import (
	"errors"
	"sync"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

type validationError interface {
	error
	ValidationErrors() any
}

// ErrorHandler handles errors returned by the server.
// This handles logging the error and returning an error message to the client.
func ErrorHandler(logger ...*zap.Logger) fiber.ErrorHandler {
	getLogger := sync.OnceValue(func() *zap.Logger {
		var log *zap.Logger
		if len(logger) > 0 {
			log = logger[0]
		} else {
			log = zap.L()
		}

		// disable stacktrace for messages logged from this function.
		// This is disabled because the stacktrace does not contain any information about the handler function.
		return log.WithOptions(zap.AddStacktrace(zap.PanicLevel))
	})

	return func(ctx fiber.Ctx, err error) error {
		if err != nil {
			// If the error is a fiber.Error, it is an api error that should be sent to the client.
			var fiberError *fiber.Error
			if errors.As(err, &fiberError) {
				getLogger().Warn("Request returned error", zap.Error(err), zap.String("path", string(ctx.Request().URI().Path())))
				return ctx.Status(fiberError.Code).JSON(dto.Error(fiberError.Message))
			}

			// If the error is a validation error, send a bad request error with the validation error details
			if verr, ok := err.(validationError); ok {
				getLogger().Warn("Invalid request from client", zap.Error(err), zap.String("path", string(ctx.Request().URI().Path())))
				return ctx.Status(fiber.StatusBadRequest).JSON(dto.Error(verr.Error(), verr.ValidationErrors()))
			}

			getLogger().Error("Error occurred while handling request", zap.Error(err), zap.String("path", string(ctx.Request().URI().Path())))
			return ctx.Status(fiber.StatusInternalServerError).JSON(dto.Error("An internal error occurred while handling the request"))
		}
		return nil
	}
}
