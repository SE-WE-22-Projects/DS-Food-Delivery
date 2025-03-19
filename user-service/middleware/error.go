package middleware

import (
	"errors"
	"log"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/gofiber/fiber/v3"
)

func ErrorHandler() fiber.ErrorHandler {
	return func(ctx fiber.Ctx, err error) error {
		if err != nil {
			var fiberError *fiber.Error
			if errors.As(err, &fiberError) {
				return ctx.Status(fiberError.Code).JSON(models.ErrorResponse{Ok: false, Error: fiberError.Message})
			}

			// TODO: proper logging
			log.Println(err)

			return ctx.Status(500).JSON(models.ErrorResponse{
				Ok:    false,
				Error: "An internal error occurred while handling the request",
			})
		}
		return nil
	}
}
