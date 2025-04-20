package repo

import (
	"context"
	"errors"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var ErrNoRes = errors.New("restaurent not found")

var ErrInvalidId = errors.New("given Id is invalid")

type RestaurentRepo interface {
	// GetAllRestaurent retrieves all restaurants from the database.
	GetAllRestaurent(ctx context.Context) ([]models.Restaurent, error)
	// GetRestaurentById retrieves a single restaurant by its ID.
	GetRestaurentById(ctx context.Context, id string) (*models.Restaurent, error)
	// CreateRestaurent creates a new restaurant in the database.
	CreateRestaurent(ctx context.Context, restaurent *models.Restaurent) (string, error)
	// UpdateRestaurentById updates the details of a restaurant by its ID.
	UpdateRestaurentById(ctx context.Context, id string, update *models.RestaurentUpdate) (*models.Restaurent, error)
	// UpdateLogoById updates the logo of a restaurant by its ID.
	UpdateLogoById(ctx context.Context, id string, image string) (*models.Restaurent, error)
	// UpdateCoverById updates the cover image of a restaurant by its ID.
	UpdateCoverById(ctx context.Context, id string, image string) (*models.Restaurent, error)
	// DeleteRestaurentById deletes (soft deletes) a restaurant by its ID.
	DeleteRestaurentById(ctx context.Context, id string) error
	// ApproveRestautrenById approve restaurent by ID
	ApproveRestaurentById(ctx context.Context, id string, approved bool) error
}

type restaurentRepo struct {
	collection *mongo.Collection
}

// CreateRestaurent implements RestaurentRepo.
func (r *restaurentRepo) CreateRestaurent(ctx context.Context, restaurent *models.Restaurent) (string, error) {
	restaurent.Id = bson.NilObjectID
	result, err := r.collection.InsertOne(ctx, restaurent)

	if err != nil {
		return "", err
	}

	if objId, ok := result.InsertedID.(bson.ObjectID); ok {
		return objId.Hex(), nil
	}

	return "", fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)

}

// DeleteRestaurentById implements RestaurentRepo.
func (r *restaurentRepo) DeleteRestaurentById(ctx context.Context, id string) error {
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

// GetAllRestaurent implements RestaurentRepo.
func (r *restaurentRepo) GetAllRestaurent(ctx context.Context) ([]models.Restaurent, error) {
	cursor, err := r.collection.Find(ctx, bson.D{{Key: "deleted_at", Value: nil}})
	if err != nil {
		return nil, err
	}

	var restaurents []models.Restaurent
	err = cursor.All(ctx, &restaurents)
	if err != nil {
		return nil, err
	}

	if len(restaurents) == 0 {
		return []models.Restaurent{}, nil
	}

	return restaurents, nil
}

// GetRestaurentById implements RestaurentRepo.
func (r *restaurentRepo) GetRestaurentById(ctx context.Context, id string) (*models.Restaurent, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Query the restaurant by its ObjectID
	var restaurent models.Restaurent
	err = r.collection.FindOne(ctx, bson.D{{Key: "_id", Value: objId}, {Key: "deleted_at", Value: nil}}).Decode(&restaurent)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoRes
		}
		return nil, err
	}

	return &restaurent, nil
}

// UpdateCoverById implements RestaurentRepo.
func (r *restaurentRepo) UpdateCoverById(ctx context.Context, id string, image string) (*models.Restaurent, error) {
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
	var restaurent models.Restaurent
	err = r.collection.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: objId}}, update).Decode(&restaurent)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoRes
		}
		return nil, err
	}

	return &restaurent, nil
}

// UpdateLogoById implements RestaurentRepo.
func (r *restaurentRepo) UpdateLogoById(ctx context.Context, id string, image string) (*models.Restaurent, error) {
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
	var restaurent models.Restaurent
	err = r.collection.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: objId}}, update).Decode(&restaurent)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoRes
		}
		return nil, err
	}

	return &restaurent, nil
}

// UpdateRestaurentById implements RestaurentRepo.
func (r *restaurentRepo) UpdateRestaurentById(ctx context.Context, id string, update *models.RestaurentUpdate) (*models.Restaurent, error) {
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
	var restaurent models.Restaurent
	if err := result.Decode(&restaurent); err != nil {
		return nil, err
	}

	// Return the updated restaurant
	return &restaurent, nil
}

func (r *restaurentRepo) ApproveRestaurentById(ctx context.Context, id string, approved bool) error{
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

func NewRestaurentRepo(con *mongo.Database) RestaurentRepo {
	return &restaurentRepo{collection: con.Collection("restaurent")}
}
