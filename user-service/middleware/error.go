package middleware

import (
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

// ErrorHandler handles errors returned by the server.
// This handles logging the error and returning an error message to the client.
func ErrorHandler(log *zap.Logger) fiber.ErrorHandler {
	// disable stacktrace for messages logged from this function.
	// This is disabled because the stacktrace does not contain any information about the handler function.
	log = log.WithOptions(zap.AddStacktrace(zap.PanicLevel))

	return func(ctx fiber.Ctx, err error) error {
		if err != nil {
			// If the error is a fiber.Error, it is an api error that should be sent to the client.
			// Other errors are internal errors.
			var fiberError *fiber.Error
			if errors.As(err, &fiberError) {
				log.Warn("Request returned error", zap.Error(err), zap.String("path", ctx.Request().URI().String()))
				return ctx.Status(fiberError.Code).JSON(models.ErrorResponse{Ok: false, Error: fiberError.Message})
			}

			log.Error("Error occurred while handling request", zap.Error(err), zap.String("path", ctx.Request().URI().String()))
			return ctx.Status(500).JSON(models.ErrorResponse{
				Ok:    false,
				Error: "An internal error occurred while handling the request",
			})
		}
		return nil
	}
}
