package handlers

import (
	"slices"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/location"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.uber.org/zap"
)

type Order struct {
	repo     repo.OrderRepo
	log      *zap.Logger
	validate *validate.Validator
	loc      *location.LocationService
}

func NewOrder(logger *zap.Logger, db repo.OrderRepo, loc *location.LocationService) *Order {
	return &Order{
		repo:     db,
		log:      logger,
		validate: validate.New(),
		loc:      loc,
	}
}

func (o *Order) CreateOrder(c fiber.Ctx) error {
	// Get user id from the request
	userId := c.Params("userId")
	if len(userId) == 0 {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing user id"})
	}

	var order orderCreate
	err := c.Bind().Body(&order)
	if err != nil {
		return sendError(c, o.log, err)
	}

	// validate the request
	err = o.validate.Validate(order)
	if err != nil {
		return sendError(c, o.log, err)
	}

	coords := order.Address.Coords
	address := order.Address.Address
	address.Position = models.Point{Coordinates: [2]float64{coords.Longitude, coords.Latitude}, Type: "point"}

	orderId, err := o.repo.CreateOrderFromCart(c.RequestCtx(), userId, &address)
	if err != nil {
		return sendError(c, o.log, err)
	}

	return c.Status(fiber.StatusCreated).JSON(models.Response{Ok: true, Data: fiber.Map{"orderId": orderId.Hex()}})
}

func (o *Order) GetByRestaurant(c fiber.Ctx) error {
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Missing restaurant id"})
	}

	status := c.Query("status", "")
	if status != "" {
		if !slices.Contains(models.AllStatuses, models.OrderStatus(status)) {
			return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid status"})
		}
	}

	orders, err := o.repo.GetOrdersByRestaurant(c.RequestCtx(), restaurantId, models.OrderStatus(status))
	if err != nil {
		return sendError(c, o.log, err)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: orders})
}

func (o *Order) GetByAll(c fiber.Ctx) error {
	status := c.Query("status", "")
	if status != "" {
		if !slices.Contains(models.AllStatuses, models.OrderStatus(status)) {
			return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid status"})
		}
	}

	orders, err := o.repo.GetAllOrders(c.RequestCtx(), models.OrderStatus(status))
	if err != nil {
		return sendError(c, o.log, err)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: orders})
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

func (o *Order) SetRestaurantOrderStatus(c fiber.Ctx) error {
	// Get user id from the request
	orderId, err := bson.ObjectIDFromHex(c.Params("orderId"))
	if err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid or missing order id"})
	}

	type request struct {
		Status string `json:"status"`
		Reason string `json:"reason"`
	}

	var req request
	err = c.Bind().Body(&req)
	if err != nil {
		return sendError(c, o.log, err)
	}

	if !slices.Contains(models.RestaurantStatuses, models.OrderStatus(req.Status)) {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid status"})
	}

	switch models.OrderStatus(req.Status) {
	case models.StatusPreparing:
		err = o.repo.UpdateAcceptedStatus(c.RequestCtx(), orderId, true, "")
	case models.StatusRejected:
		err = o.repo.UpdateAcceptedStatus(c.RequestCtx(), orderId, true, req.Reason)
	case models.StatusAwaitingPickup:
		err = o.repo.SetOrderPickupReady(c.RequestCtx(), orderId)
	default:
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid status"})
	}

	if err == repo.ErrStateChange {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "Invalid state change"})
	} else if err != nil {
		return sendError(c, o.log, err)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: "Order updated successfully"})
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
