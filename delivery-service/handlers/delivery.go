package handlers

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/app"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type Delivery struct {
	app *app.App
}

func NewDelivery(app *app.App) *Delivery {
	return &Delivery{app: app}
}

func (d *Delivery) GetMyDeliveries(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveries, err := d.app.GetUserDeliveries(c.RequestCtx(), driverId)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: deliveries})
}

func (d *Delivery) GetNearbyDeliveries(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveries, err := d.app.GetNearbyDeliveries(c.RequestCtx(), driverId)
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

	order, err := d.app.GetDelivery(c.RequestCtx(), deliveryId)
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

	order, err := d.app.ClaimDelivery(c.RequestCtx(), driverId, deliveryId)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: order})
}

func (d *Delivery) PickupOrder(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveryId, err := bson.ObjectIDFromHex(c.Params("deliveryId"))
	if err != nil {
		return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Missing delivery id"})
	}

	order, err := d.app.PickupOrder(c.RequestCtx(), driverId, deliveryId)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: order})
}

func (d *Delivery) CompleteOrder(c fiber.Ctx) error {
	driverId := middleware.GetUser(c).UserId
	deliveryId, err := bson.ObjectIDFromHex(c.Params("deliveryId"))
	if err != nil {
		return c.Status(400).JSON(dto.ErrorResponse{Ok: false, Error: "Missing delivery id"})
	}

	order, err := d.app.CompleteOrder(c.RequestCtx(), driverId, deliveryId)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(200).JSON(dto.Response{Ok: true, Data: order})
}
