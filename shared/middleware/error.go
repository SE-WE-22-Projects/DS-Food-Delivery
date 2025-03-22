package middleware

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

type validationError interface {
	error
	ValidationErrors() any
}

// ErrorHandler handles errors returned by the server.
// This handles logging the error and returning an error message to the client.
func ErrorHandler(log *zap.Logger) fiber.ErrorHandler {
	// disable stacktrace for messages logged from this function.
	// This is disabled because the stacktrace does not contain any information about the handler function.
	log = log.WithOptions(zap.AddStacktrace(zap.PanicLevel))

	return func(ctx fiber.Ctx, err error) error {
		if err != nil {
			// If the error is a fiber.Error, it is an api error that should be sent to the client.
			var fiberError *fiber.Error
			if errors.As(err, &fiberError) {
				log.Warn("Request returned error", zap.Error(err), zap.String("path", string(ctx.Request().URI().Path())))
				return ctx.Status(fiberError.Code).JSON(fiber.Map{"ok": false, "error": fiberError.Message})
			}

			// If the error is a validation error, send a bad request error with the validation error details
			if verr, ok := err.(validationError); ok {
				log.Warn("Invalid request from client", zap.Error(err), zap.String("path", string(ctx.Request().URI().Path())))
				return ctx.Status(400).JSON(fiber.Map{"ok": false, "error": verr.Error(), "reason": verr.ValidationErrors()})
			}

			log.Error("Error occurred while handling request", zap.Error(err), zap.String("path", string(ctx.Request().URI().Path())))
			return ctx.Status(fiberError.Code).JSON(fiber.Map{"ok": false, "error": "An internal error occurred while handling the request"})
		}
		return nil
	}
}
