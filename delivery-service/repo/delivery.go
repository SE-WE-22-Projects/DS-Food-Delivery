package repo

import (
	"context"
	"errors"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var ErrAlreadyClaimed = errors.New("already claimed")
var ErrNoDelivery = errors.New("delivery not found")

type DeliveryRepo interface {
	AddDelivery(ctx context.Context, data *models.Delivery) (string, error)
	GetByDeliveryDriver(ctx context.Context, driverId string) ([]*models.Delivery, error)
	GetNearbyDeliveries(ctx context.Context, driverId string) ([]*models.Delivery, error)
	GetById(ctx context.Context, deliveryId bson.ObjectID) (*models.Delivery, error)
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
	data.State = models.DeliveryStateUnclaimed

	result, err := d.db.InsertOne(ctx, data)

	if err != nil {
		return "", err
	}

	if objId, ok := result.InsertedID.(bson.ObjectID); ok {
		return objId.Hex(), nil
	}

	return "", fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)
}

func (d *deliveryRepo) GetByDeliveryDriver(ctx context.Context, driverId string) ([]*models.Delivery, error) {
	result, err := d.db.Find(ctx, bson.D{{Key: "driver_id", Value: driverId}})
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

func (d *deliveryRepo) GetNearbyDeliveries(ctx context.Context, driverId string) ([]*models.Delivery, error) {
	result, err := d.db.Find(ctx, bson.D{{Key: "driver_id", Value: nil}, {Key: "state", Value: models.DeliveryStateUnclaimed}})
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

func (d *deliveryRepo) GetById(ctx context.Context, deliveryId bson.ObjectID) (*models.Delivery, error) {
	var delivery models.Delivery
	err := d.db.FindOne(ctx, bson.D{{Key: "_id", Value: deliveryId}, {Key: "driver_id", Value: nil}, {Key: "state", Value: models.DeliveryStateUnclaimed}}).Decode(&delivery)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrAlreadyClaimed
		}
		return nil, err
	}

	return &delivery, nil
}

func (d *deliveryRepo) ClaimDelivery(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error) {
	var delivery models.Delivery
	err := d.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "_id", Value: deliveryId}, {Key: "driver_id", Value: nil}, {Key: "state", Value: models.DeliveryStateUnclaimed}},
		bson.D{{Key: "$set", Value: bson.D{{Key: "driver_id", Value: driverId}, {Key: "state", Value: models.DeliveryStateWaiting}}}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&delivery)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrAlreadyClaimed
		}
		return nil, err
	}

	return &delivery, nil
}

func (d *deliveryRepo) DeliveryPickup(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error) {
	var delivery models.Delivery
	err := d.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "_id", Value: deliveryId}, {Key: "driver_id", Value: driverId}},
		bson.D{{Key: "$set", Value: bson.D{{Key: "state", Value: models.DeliveryStateDelivering}}}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&delivery)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoDelivery
		}
		return nil, err
	}

	return &delivery, nil
}

func (d *deliveryRepo) DeliveryComplete(ctx context.Context, deliveryId bson.ObjectID, driverId string) (*models.Delivery, error) {
	var delivery models.Delivery
	err := d.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "_id", Value: deliveryId}, {Key: "driver_id", Value: driverId}},
		bson.D{{Key: "$set", Value: bson.D{{Key: "state", Value: models.DeliveryStateDone}}}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&delivery)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoDelivery
		}
		return nil, err
	}

	return &delivery, nil
}

func NewDeliveryRepo(db *mongo.Database) (DeliveryRepo, error) {
	return &deliveryRepo{db: db.Collection("deliveries")}, nil
}
