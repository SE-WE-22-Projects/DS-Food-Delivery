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
	GetNearbyDeliveries(ctx context.Context, driverId string) ([]*models.Delivery, error)
	ClaimDelivery(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error)
	DeliveryPickup(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error)
	DeliveryComplete(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error)
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
	result, err := d.db.Find(ctx, bson.D{{Key: "driver_id", Value: nil}, {Key: "state", Value: models.DeliveryStateReady}})
	if err != nil {
		return nil, err
	}

	var deliveries []*models.Delivery
	err = result.All(ctx, &deliveries)
	if err != nil {
		return nil, err
	}

	if len(deliveries) == 0 {
		deliveries = []*models.Delivery{}
	}

	return deliveries, nil
}

func (d *deliveryRepo) ClaimDelivery(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error) {
	var delivery models.Delivery
	err := d.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "_id", Value: deliveryId}, {Key: "driver_id", Value: nil}, {Key: "state", Value: models.DeliveryStateReady}},
		bson.D{{Key: "$set", Value: bson.D{{Key: "driver_id", Value: driverId}}}},
	).Decode(&delivery)
	if err != nil {
		return nil, err
	}

	return &delivery, nil
}

func (d *deliveryRepo) DeliveryPickup(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error) {
	var delivery models.Delivery
	err := d.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "_id", Value: deliveryId}, {Key: "driver_id", Value: driverId}},
		bson.D{{Key: "$set", Value: bson.D{{Key: "state", Value: models.DeliveryStateDelivering}}}},
	).Decode(&delivery)
	if err != nil {
		return nil, err
	}

	return &delivery, nil
}

func (d *deliveryRepo) DeliveryComplete(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error) {
	var delivery models.Delivery
	err := d.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "_id", Value: deliveryId}, {Key: "driver_id", Value: driverId}},
		bson.D{{Key: "$set", Value: bson.D{{Key: "state", Value: models.DeliveryStateDone}}}},
	).Decode(&delivery)
	if err != nil {
		return nil, err
	}

	return &delivery, nil
}

func NewDeliveryRepo(db *mongo.Database) (DeliveryRepo, error) {
	return &deliveryRepo{db: db.Collection("deliveries")}, nil
}
