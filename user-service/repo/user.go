package repo

import (
	"context"
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// ErrNoUser indicates that the user with the given id does not exist in the database
var ErrNoUser = errors.New("user with the given id was not found")

type UserRepo interface {
	// Gets all users in the database
	GetAllUsers(ctx context.Context) ([]models.User, error)
	// CreateUser creates a new user using the given data.
	CreateUser(ctx context.Context, data *models.CreateUser) (any, error)
	// GetUserById gets the user with the given id.
	// If the user does not exist, [ErrNoUser] is returned.
	GetUserById(ctx context.Context, id string) (*models.User, error)

	// DeleteUserById deletes the user with the given id.
	// If the user does not exist, [ErrNoUser] is returned.
	DeleteUserById(ctx context.Context, id string) error
}

type userRepo struct {
	collection *mongo.Collection
}

// Gets all users in the database
func (u *userRepo) GetAllUsers(ctx context.Context) ([]models.User, error) {
	cursor, err := u.collection.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}

	var users []models.User
	err = cursor.All(ctx, &users)
	if err != nil {
		return nil, err
	}

	if len(users) == 0 {
		return []models.User{}, nil
	}

	return users, nil
}

// CreateUser creates a new user using the given data.
func (u *userRepo) CreateUser(ctx context.Context, data *models.CreateUser) (any, error) {
	result, err := u.collection.InsertOne(ctx, data.ToUser())

	if err != nil {
		return nil, err
	}
	return result.InsertedID, nil
}

// GetUserById gets the user with the given id.
// If the user does not exist, [ErrNoUser] is returned.
func (u *userRepo) GetUserById(ctx context.Context, id string) (*models.User, error) {

	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	result := u.collection.FindOne(ctx, bson.D{{Key: "_id", Value: objId}})
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNoUser
		}
		return nil, err
	}

	var user models.User

	if err := result.Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

// DeleteUserById deletes the user with the given id.
// If the user does not exist, [ErrNoUser] is returned.
func (u *userRepo) DeleteUserById(ctx context.Context, id string) error {
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	result, err := u.collection.DeleteOne(ctx, bson.D{{Key: "_id", Value: objId}})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return ErrNoUser
	}

	return nil
}

func NewUserRepo(con *mongo.Client) UserRepo {
	return &userRepo{collection: con.Database("user-service").Collection("user")}
}
