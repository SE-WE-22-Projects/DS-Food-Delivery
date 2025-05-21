package app

import (
	"context"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/repo"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
)

type ServiceConfig struct {
	Order string
}

type App struct {
	orders *grpc.OrderClient
	db     repo.DeliveryRepo
}

func New(cfg ServiceConfig, mongodb *mongo.Client) (*App, error) {
	db := mongodb.Database("delivery-service")
	delivery, err := repo.NewDeliveryRepo(db)
	if err != nil {
		return nil, err
	}

	orderClient, err := grpc.NewOrderClient(cfg.Order)
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to order service: %w", err)
	}
	zap.S().Infof("Connected to restaurant service at %s", cfg.Order)

	app := &App{db: delivery, orders: orderClient}

	return app, nil
}

func (d *App) CreateDelivery(ctx context.Context, data *models.Delivery) (string, error) {
	order, err := d.db.AddDelivery(ctx, data)
	if err != nil {
		return "", err
	}

	return order, nil
}

func (d *App) GetUserDeliveries(ctx context.Context, userID string) ([]*models.Delivery, error) {
	deliveries, err := d.db.GetByDeliveryDriver(ctx, userID)
	if err != nil {
		return nil, err
	}

	return deliveries, nil
}

func (d *App) GetNearbyDeliveries(ctx context.Context, userID string) ([]*models.Delivery, error) {
	deliveries, err := d.db.GetNearbyDeliveries(ctx, userID)
	if err != nil {
		return nil, err
	}

	return deliveries, nil
}

func (d *App) GetDelivery(ctx context.Context, deliveryID bson.ObjectID) (*models.Delivery, error) {
	order, err := d.db.GetById(ctx, deliveryID)
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (d *App) GetDeliveryByOrderId(ctx context.Context, orderID string) (*models.Delivery, error) {
	order, err := d.db.GetByOrderId(ctx, orderID)
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (d *App) ClaimDelivery(ctx context.Context, driverID string, deliveryID bson.ObjectID) (*models.Delivery, error) {
	order, err := d.db.ClaimDelivery(ctx, deliveryID, driverID)
	if err != nil {
		return nil, err
	}

	err = d.orders.SetDeliveryDriver(ctx, order.OrderId, driverID)
	if err != nil {
		zap.L().Error("Failed to send order state update", zap.Error(err))
	}

	return order, nil
}

func (d *App) PickupOrder(ctx context.Context, driverID string, deliveryID bson.ObjectID) (*models.Delivery, error) {
	order, err := d.db.DeliveryPickup(ctx, deliveryID, driverID)
	if err != nil {
		return nil, err
	}

	err = d.orders.SetOrderPickUp(ctx, order.OrderId)
	if err != nil {
		zap.L().Error("Failed to send order state update", zap.Error(err))
	}

	return order, nil
}

func (d *App) CompleteOrder(ctx context.Context, driverID string, deliveryID bson.ObjectID) (*models.Delivery, error) {
	order, err := d.db.DeliveryComplete(ctx, deliveryID, driverID)
	if err != nil {
		return nil, err
	}

	err = d.orders.SetOrderDelivered(ctx, order.OrderId)
	if err != nil {
		zap.L().Error("Failed to send order state update", zap.Error(err))
	}

	return order, nil
}
