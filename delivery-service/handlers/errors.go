package handlers

import (
	"io"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

func sendError(ctx fiber.Ctx, err error) error {
	switch err {
	case repo.ErrAlreadyClaimed:
		return ctx.Status(fiber.StatusConflict).JSON(dto.ErrorResponse{Ok: false, Error: "Delivery has already been claimed"})
	case repo.ErrNoDelivery:
		return ctx.Status(fiber.StatusNotFound).JSON(dto.ErrorResponse{Ok: false, Error: "Delivery was not found"})
	case fiber.ErrUnprocessableEntity, io.EOF, io.ErrUnexpectedEOF:
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(dto.ErrorResponse{Ok: false, Error: "Request body is missing or truncated"})
	}

	if verr, ok := err.(*validate.ValidationErrors); ok {
		return ctx.Status(400).JSON(fiber.Map{"ok": false, "error": verr.Error(), "reason": verr.ValidationErrors()})
	} else if fiberErr, ok := err.(*fiber.Error); ok {
		return ctx.Status(fiberErr.Code).JSON(fiber.Map{"ok": false, "error": fiberErr.Message})
	} else {
		zap.L().Error("Request failed due to error", zap.Error(err))
		return ctx.Status(500).JSON(dto.ErrorResponse{Ok: false, Error: "Internal server error"})
	}
}
