package handlers

import (
	"io"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

func sendError(ctx fiber.Ctx, log *zap.Logger, err error) error {
	switch err {
	case repo.ErrInvalidId:
		return ctx.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{Ok: false, Error: "Invalid user id"})
	case repo.ErrNotInCart:
		return ctx.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{Ok: false, Error: "Item with the given cartItemId does not exist in cart"})
	case fiber.ErrUnprocessableEntity, io.EOF, io.ErrUnexpectedEOF:
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(models.ErrorResponse{Ok: false, Error: "Request body is missing or truncated"})
	case repo.ErrEmptyCart:
		return ctx.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{Ok: false, Error: "User cart is empty"})
	case repo.ErrCannotCancelOrder:
		return ctx.Status(fiber.StatusConflict).JSON(models.ErrorResponse{Ok: false, Error: "Order cannot be canceled"})
	case repo.ErrNoOrder:
		return ctx.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{Ok: false, Error: "Order with the given id was not found"})
	}

	if verr, ok := err.(*validate.ValidationErrors); ok {
		return ctx.Status(400).JSON(fiber.Map{"ok": false, "error": verr.Error(), "reason": verr.ValidationErrors()})
	} else if fiberErr, ok := err.(*fiber.Error); ok {
		return ctx.Status(fiberErr.Code).JSON(fiber.Map{"ok": false, "error": fiberErr.Message})
	} else {
		log.Error("Request failed due to error", zap.Error(err))
		return ctx.Status(500).JSON(models.ErrorResponse{Ok: false, Error: "Internal server error"})
	}
}
