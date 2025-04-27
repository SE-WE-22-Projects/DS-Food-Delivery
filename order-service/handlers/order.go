package handlers

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.uber.org/zap"
)

type Order struct {
	repo     repo.OrderRepo
	log      *zap.Logger
	validate *validate.Validator
}

func NewOrder(logger *zap.Logger, db repo.OrderRepo) *Order {
	return &Order{
		repo:     db,
		log:      logger,
		validate: validate.New(),
	}
}

func (o *Order) CreateOrder(c fiber.Ctx) error {
	// Get user id from the request
	userId := c.Params("userId")
	if len(userId) == 0 {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	orderId, err := o.repo.CreateOrderFromCart(c.RequestCtx(), userId)
	if err != nil {
		return sendError(c, o.log, err)
	}

	return c.Status(fiber.StatusCreated).JSON(models.Response{Ok: true, Data: fiber.Map{"orderId": orderId.Hex()}})
}

func (o *Order) GetOrder(c fiber.Ctx) error {
	// Get user id from the request
	orderId, err := bson.ObjectIDFromHex(c.Params("orderId"))
	if err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid or missing order id"})
	}

	order, err := o.repo.GetOrderById(c.RequestCtx(), orderId)
	if err != nil {
		return sendError(c, o.log, err)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: order})
}
func (o *Order) CancelOrder(c fiber.Ctx) error {
	// Get user id from the request
	orderId, err := bson.ObjectIDFromHex(c.Params("orderId"))
	if err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid or missing order id"})
	}

	err = o.repo.CancelOrder(c.RequestCtx(), orderId)
	if err != nil {
		return sendError(c, o.log, err)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: "Order canceled successfully"})
}
