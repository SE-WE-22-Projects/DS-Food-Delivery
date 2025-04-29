package repo

import (
	"context"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type DeliveryRepo interface {
	AddDelivery(ctx context.Context, data *models.Delivery) (string, error)
}

type deliveryRepo struct {
	db *mongo.Collection
}

func (d *deliveryRepo) AddDelivery(ctx context.Context, data *models.Delivery) (string, error) {
	data.Id = bson.NilObjectID
	data.DriverId = nil
	data.State = models.DeliveryStateReady

	result, err := d.db.InsertOne(ctx, data)

	if err != nil {
		return "", err
	}

	if objId, ok := result.InsertedID.(bson.ObjectID); ok {
		return objId.Hex(), nil
	}

	return "", fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)
}

func (d *deliveryRepo) GetNearbyDeliveries(ctx context.Context, driverId string) ([]*models.Delivery, error) {
	return nil, nil
}

func NewDeliveryRepo(db *mongo.Database) (DeliveryRepo, error) {
	return &deliveryRepo{db: db.Collection("deliveries")}, nil
}
