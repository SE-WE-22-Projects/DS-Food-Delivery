package handlers

import (
	"io"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.uber.org/zap"
)

type Cart struct {
	repo     repo.CartRepo
	log      *zap.Logger
	validate *validate.Validator
}

func NewCart(logger *zap.Logger, cart repo.CartRepo) *Cart {
	return &Cart{
		repo:     cart,
		log:      logger,
		validate: validate.New(),
	}
}

func (c *Cart) GetCart(ctx fiber.Ctx) (err error) {
	// Get user id from the request
	userId := ctx.Params("userId")
	if len(userId) == 0 {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	// get cart from db
	cart, err := c.repo.GetCartByUserId(ctx.RequestCtx(), userId)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	return ctx.Status(200).JSON(models.Response{Ok: true, Data: cart})
}

func (c *Cart) ClearCart(ctx fiber.Ctx) error {
	// Get user id from the request
	userId := ctx.Params("userId")
	if len(userId) == 0 {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	err := c.repo.ClearCart(ctx.RequestCtx(), userId)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	return ctx.SendStatus(fiber.StatusNoContent)
}

func (c *Cart) AddToCart(ctx fiber.Ctx) (err error) {
	// Get user id from the request
	userId := ctx.Params("userId")
	if len(userId) == 0 {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	var item cartItem

	err = ctx.Bind().Body(&item)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	// validate the request
	err = c.validate.Validate(item)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	cart, err := c.repo.AddItem(ctx.RequestCtx(), userId, item.Id, item.Amount, item.Data)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	return ctx.Status(200).JSON(models.Response{Ok: true, Data: cart})
}

func (c *Cart) RemoveFromCart(ctx fiber.Ctx) error {
	// Get user id from the request
	userId := ctx.Params("userId")
	if len(userId) == 0 {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	cartItemId, err := bson.ObjectIDFromHex(ctx.Params("cartItemId"))
	if err != nil {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid cart item id"})
	}

	err = c.repo.RemoveItem(ctx.RequestCtx(), userId, cartItemId)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	return ctx.SendStatus(fiber.StatusNoContent)
}

func (c *Cart) UpdateCartItem(ctx fiber.Ctx) error {
	// Get user id from the request
	userId := ctx.Params("userId")
	if len(userId) == 0 {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	cartItemId, err := bson.ObjectIDFromHex(ctx.Params("cartItemId"))
	if err != nil {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid cart item id"})
	}

	var item cartItemUpdate

	err = ctx.Bind().Body(&item)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	// validate the request
	err = c.validate.Validate(item)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	cart, err := c.repo.UpdateItem(ctx.RequestCtx(), userId, cartItemId, item.Amount, item.Data)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	return ctx.Status(200).JSON(models.Response{Ok: true, Data: cart})
}

func (c *Cart) ApplyCoupon(ctx fiber.Ctx) (err error) {
	// Get user id from the request
	userId := ctx.Params("userId")
	if len(userId) == 0 {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	var coupon couponCode
	err = ctx.Bind().Body(&coupon)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	// validate the request
	err = c.validate.Validate(coupon)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	cart, err := c.repo.SetCartCoupon(ctx.RequestCtx(), userId, coupon.Id)
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	return ctx.Status(200).JSON(models.Response{Ok: true, Data: cart})
}

func (c *Cart) RemoveCoupon(ctx fiber.Ctx) error {
	// Get user id from the request
	userId := ctx.Params("userId")
	if len(userId) == 0 {
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	cart, err := c.repo.SetCartCoupon(ctx.RequestCtx(), userId, "")
	if err != nil {
		return sendError(ctx, c.log, err)
	}

	return ctx.Status(200).JSON(models.Response{Ok: true, Data: cart})
}

func sendError(ctx fiber.Ctx, log *zap.Logger, err error) error {
	switch err {
	case repo.ErrInvalidId:
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid user id"})
	case repo.ErrNotInCart:
		return ctx.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Item with the given cartItemId does not exist in cart"})
	case fiber.ErrUnprocessableEntity, io.EOF, io.ErrUnexpectedEOF:
		return ctx.Status(fiber.StatusUnprocessableEntity).JSON(models.ErrorResponse{Ok: false, Error: "Request body is missing or truncated"})
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
