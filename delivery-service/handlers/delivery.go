package handlers

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.uber.org/zap"
)

type Delivery struct {
	orders *grpc.OrderClient
	db     repo.DeliveryRepo
}

func (d *Delivery) GetMyDeliveries(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveries, err := d.db.GetByDeliveryDriver(c.RequestCtx(), driverId)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: deliveries})
}

func (d *Delivery) GetNearbyDeliveries(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveries, err := d.db.GetNearbyDeliveries(c.RequestCtx(), driverId)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: deliveries})
}

func (d *Delivery) GetDelivery(c fiber.Ctx) error {
	deliveryId, err := bson.ObjectIDFromHex(c.Params("deliveryId"))
	if err != nil {
		return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Missing delivery id"})
	}

	order, err := d.db.GetById(c.RequestCtx(), deliveryId)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: order})
}

func (d *Delivery) ClaimDelivery(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveryId, err := bson.ObjectIDFromHex(c.Params("deliveryId"))
	if err != nil {
		return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Missing delivery id"})
	}

	order, err := d.db.ClaimDelivery(c.RequestCtx(), deliveryId, driverId)
	if err != nil {
		return sendError(c, err)
	}

	err = d.orders.SetDeliveryDriver(c.RequestCtx(), order.OrderId, driverId)
	if err != nil {
		zap.L().Error("Failed to send order state update", zap.Error(err))
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: order})
}

func (d *Delivery) PickupOrder(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveryId, err := bson.ObjectIDFromHex(c.Params("deliveryId"))
	if err != nil {
		return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Missing delivery id"})
	}

	order, err := d.db.DeliveryPickup(c.RequestCtx(), deliveryId, driverId)
	if err != nil {
		return sendError(c, err)
	}

	err = d.orders.SetOrderPickUp(c.RequestCtx(), order.OrderId)
	if err != nil {
		zap.L().Error("Failed to send order state update", zap.Error(err))
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: order})
}

func (d *Delivery) CompleteOrder(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveryId, err := bson.ObjectIDFromHex(c.Params("deliveryId"))
	if err != nil {
		return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Missing delivery id"})
	}

	order, err := d.db.DeliveryComplete(c.RequestCtx(), deliveryId, driverId)
	if err != nil {
		return sendError(c, err)
	}

	err = d.orders.SetOrderDelivered(c.RequestCtx(), order.OrderId)
	if err != nil {
		zap.L().Error("Failed to send order state update", zap.Error(err))
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: order})
}

func NewDelivery(db repo.DeliveryRepo, orderClient *grpc.OrderClient) *Delivery {
	return &Delivery{db: db, orders: orderClient}
}
