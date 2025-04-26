package repo

import (
	"context"
	"errors"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var ErrNoRes = errors.New("restaurant not found")

var ErrInvalidId = errors.New("given Id is invalid")

type RestaurantFilter byte

const (
	RestaurantFilterAll RestaurantFilter = iota
	RestaurantFilterApprove
	RestaurantFilterPending
)

type RestaurantRepo interface {
	// GetAllRestaurant retrieves all restaurants from the database.
	GetAllRestaurant(ctx context.Context, filter RestaurantFilter) ([]models.Restaurant, error)
	// GetRestaurantById retrieves a single restaurant by its ID.
	GetRestaurantById(ctx context.Context, id string) (*models.Restaurant, error)
	// CreateRestaurant creates a new restaurant in the database.
	CreateRestaurant(ctx context.Context, restaurant *models.Restaurant) (string, error)
	// UpdateRestaurantById updates the details of a restaurant by its ID.
	UpdateRestaurantById(ctx context.Context, id string, update *models.RestaurantUpdate) (*models.Restaurant, error)
	// UpdateLogoById updates the logo of a restaurant by its ID.
	UpdateLogoById(ctx context.Context, id string, image string) (*models.Restaurant, error)
	// UpdateCoverById updates the cover image of a restaurant by its ID.
	UpdateCoverById(ctx context.Context, id string, image string) (*models.Restaurant, error)
	// DeleteRestaurantById deletes (soft deletes) a restaurant by its ID.
	DeleteRestaurantById(ctx context.Context, id string) error
	// ApproveRestaurantById approve restaurant by ID
	ApproveRestaurantById(ctx context.Context, id string, approved bool) error
}

type restaurantRepo struct {
	collection *mongo.Collection
}

// CreateRestaurant implements RestaurantRepo.
func (r *restaurantRepo) CreateRestaurant(ctx context.Context, restaurant *models.Restaurant) (string, error) {
	restaurant.Id = bson.NilObjectID
	result, err := r.collection.InsertOne(ctx, restaurant)

	if err != nil {
		return "", err
	}

	if objId, ok := result.InsertedID.(bson.ObjectID); ok {
		return objId.Hex(), nil
	}

	return "", fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)

}

// DeleteRestaurantById implements RestaurantRepo.
func (r *restaurantRepo) DeleteRestaurantById(ctx context.Context, id string) error {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return ErrInvalidId
	}

	// Perform the update to set the 'deleted_at' field to the current timestamp
	_, err = r.collection.UpdateOne(
		ctx,
		bson.D{{Key: "_id", Value: objId}},
		bson.D{{Key: "$currentDate", Value: bson.D{{Key: "deleted_at", Value: true}}}},
	)

	// Return any error encountered
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrNoRes
		}
		return err
	}

	return nil
}

// GetAllRestaurant implements RestaurantRepo.
func (r *restaurantRepo) GetAllRestaurant(ctx context.Context, filter RestaurantFilter) ([]models.Restaurant, error) {
	queryFilter := bson.D{{Key: "deleted_at", Value: nil}}

	switch filter {
	case RestaurantFilterApprove:
		queryFilter = append(queryFilter, bson.E{Key: "approved", Value: true})
	case RestaurantFilterPending:
		queryFilter = append(queryFilter, bson.E{Key: "approved", Value: false})
	}

	cursor, err := r.collection.Find(ctx, queryFilter)
	if err != nil {
		return nil, err
	}

	var restaurants []models.Restaurant
	err = cursor.All(ctx, &restaurants)
	if err != nil {
		return nil, err
	}

	if len(restaurants) == 0 {
		return []models.Restaurant{}, nil
	}

	return restaurants, nil
}

// GetRestaurantById implements RestaurantRepo.
func (r *restaurantRepo) GetRestaurantById(ctx context.Context, id string) (*models.Restaurant, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Query the restaurant by its ObjectID
	var restaurant models.Restaurant
	err = r.collection.FindOne(ctx, bson.D{{Key: "_id", Value: objId}, {Key: "deleted_at", Value: nil}}).Decode(&restaurant)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoRes
		}
		return nil, err
	}

	return &restaurant, nil
}

// UpdateCoverById implements RestaurantRepo.
func (r *restaurantRepo) UpdateCoverById(ctx context.Context, id string, image string) (*models.Restaurant, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Perform the update to set the cover image
	update := bson.D{
		{Key: "$set", Value: bson.D{{Key: "cover_image", Value: image}}},
	}

	// Update the document in the collection
	var restaurant models.Restaurant
	err = r.collection.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: objId}}, update).Decode(&restaurant)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoRes
		}
		return nil, err
	}

	return &restaurant, nil
}

// UpdateLogoById implements RestaurantRepo.
func (r *restaurantRepo) UpdateLogoById(ctx context.Context, id string, image string) (*models.Restaurant, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Perform the update to set the logo image
	update := bson.D{
		{Key: "$set", Value: bson.D{{Key: "logo_image", Value: image}}},
	}

	// Update the document in the collection
	var restaurant models.Restaurant
	err = r.collection.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: objId}}, update).Decode(&restaurant)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoRes
		}
		return nil, err
	}

	return &restaurant, nil
}

// UpdateRestaurantById implements RestaurantRepo.
func (r *restaurantRepo) UpdateRestaurantById(ctx context.Context, id string, update *models.RestaurantUpdate) (*models.Restaurant, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Perform the update operation
	result := r.collection.FindOneAndUpdate(
		ctx,
		// Filter: Check if the restaurant exists and is not deleted
		bson.D{{Key: "_id", Value: objId}, {Key: "deleted_at", Value: nil}},
		// Update: Apply the update and set the current timestamp for the 'updated_at' field
		bson.D{bson.E{Key: "$set", Value: update}, {Key: "$currentDate", Value: bson.D{{Key: "updated_at", Value: true}}}},
		// Return the updated document (After operation)
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	// Check for errors in the update operation
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNoRes
		}
		return nil, err
	}

	// Decode the updated restaurant document
	var restaurant models.Restaurant
	if err := result.Decode(&restaurant); err != nil {
		return nil, err
	}

	// Return the updated restaurant
	return &restaurant, nil
}

func (r *restaurantRepo) ApproveRestaurantById(ctx context.Context, id string, approved bool) error {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return ErrInvalidId
	}

	// Perform approve operation
	err = r.collection.FindOneAndUpdate(
		ctx,
		// Filter: Check if the restaurant exists and is not deleted
		bson.D{{Key: "_id", Value: objId}, {Key: "deleted_at", Value: nil}},
		bson.D{{Key: "$set", Value: bson.E{Key: "approved", Value: approved}}},
	).Err()

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrNoRes
		}
		return err
	}
	return nil
}

func NewRestaurantRepo(con *mongo.Database) RestaurantRepo {
	return &restaurantRepo{collection: con.Collection("restaurant")}
}
