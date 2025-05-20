package handlers

import (
	"io"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/log"
	"go.uber.org/zap"
)

func sendError(ctx fiber.Ctx, err error) error {
	switch err {
	case repo.ErrNoApplication:
		return ctx.Status(fiber.StatusNotFound).JSON(dto.Error("Application with the given id was not found"))
	case repo.ErrApplicationNotPending:
		return ctx.Status(fiber.StatusConflict).JSON(dto.Error("driver application has already been handled"))
	case repo.ErrUserIsDriver:
		return ctx.Status(fiber.StatusConflict).JSON(dto.Error("user is already a driver"))
	case repo.ErrNoUser:
		return ctx.Status(fiber.StatusNotFound).JSON(dto.Error("User with the given id was not found"))
	case repo.ErrInvalidID:
		return ctx.Status(fiber.StatusBadRequest).JSON(dto.Error("Invalid id"))
	case fiber.ErrUnprocessableEntity, io.EOF, io.ErrUnexpectedEOF:
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(dto.Error("Request body is missing or truncated"))
	}

	if verr, ok := err.(*validate.ValidationErrors); ok {
		return ctx.Status(fiber.StatusBadRequest).JSON(dto.Error(verr.Error(), verr.ValidationErrors()))
	} else if fiberErr, ok := err.(*fiber.Error); ok {
		return ctx.Status(fiberErr.Code).JSON(dto.Error(fiberErr.Message))
	}

	log.Error("Request failed due to error", zap.Error(err))
	return ctx.Status(fiber.StatusInternalServerError).JSON(dto.Error("Internal server error"))
}
