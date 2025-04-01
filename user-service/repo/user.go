package repo

import (
	"context"
	"errors"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ErrNoUser indicates that the user with the given id does not exist in the database
var ErrNoUser = errors.New("user with the given id was not found")

// ErrInvalidId indicates that the given id is invalid
var ErrInvalidId = errors.New("given Id is invalid")

type UserRepo interface {
	// Gets all users in the database
	GetAllUsers(ctx context.Context) ([]models.User, error)
	// CreateUser creates a new user using the given data.
	CreateUser(ctx context.Context, user *models.User) (string, error)
	// GetUserById gets the user with the given id.
	// If the user does not exist, [ErrNoUser] is returned.
	GetUserById(ctx context.Context, id string) (*models.User, error)
	// FindUserByEmail finds the user with the given email
	FindUserByEmail(ctx context.Context, email string) (*models.User, error)
	// UpdateUserPassword updates the user's password
	UpdateUserPassword(ctx context.Context, id string, pwdHash []byte) error
	// UpdateUserImage updates the user profile image
	UpdateUserImage(ctx context.Context, id string, image string) (*models.User, error)
	// If the user does not exist, [ErrNoUser] is returned.
	// UpdateUserById updates the data of the user with the given id.
	UpdateUserById(ctx context.Context, id string, data *models.UserUpdate) (*models.User, error)
	// DeleteUserById deletes the user with the given id.
	// If the user does not exist, [ErrNoUser] is returned.
	DeleteUserById(ctx context.Context, id string) error
}

type userRepo struct {
	collection *mongo.Collection
}

// Gets all users in the database
func (u *userRepo) GetAllUsers(ctx context.Context) ([]models.User, error) {
	cursor, err := u.collection.Find(ctx, bson.D{{Key: "deleted_at", Value: nil}})
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
func (u *userRepo) CreateUser(ctx context.Context, user *models.User) (string, error) {
	user.ID = bson.NilObjectID
	if user.Roles == nil {
		user.Roles = []string{}
	}

	result, err := u.collection.InsertOne(ctx, user)

	if err != nil {
		return "", err
	}

	if objId, ok := result.InsertedID.(bson.ObjectID); ok {
		return objId.Hex(), nil
	}

	return "", fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)
}

// GetUserById gets the user with the given id.
// If the user does not exist, [ErrNoUser] is returned.
func (u *userRepo) GetUserById(ctx context.Context, id string) (*models.User, error) {
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	return findUser(ctx, u.collection, bson.E{Key: "_id", Value: objId})
}

// FindUserByEmail finds the user with the given email
func (u *userRepo) FindUserByEmail(ctx context.Context, email string) (*models.User, error) {
	return findUser(ctx, u.collection, bson.E{Key: "email", Value: email})
}

// UpdateUserImage updates the user profile image
func (u *userRepo) UpdateUserImage(ctx context.Context, id string, image string) (*models.User, error) {
	return updateUserById(ctx, u.collection, id, bson.E{Key: "$set", Value: bson.D{{Key: "profile_image", Value: image}}})
}

// UpdateUserPassword implements UserRepo.
func (u *userRepo) UpdateUserPassword(ctx context.Context, id string, pwdHash []byte) error {
	_, err := updateUserById(ctx, u.collection, id, bson.E{Key: "$set", Value: bson.D{{Key: "password", Value: string(pwdHash)}}})
	return err
}

// If the user does not exist, [ErrNoUser] is returned.
// UpdateUserById updates the data of the user with the given id.
func (u *userRepo) UpdateUserById(ctx context.Context, id string, data *models.UserUpdate) (*models.User, error) {
	return updateUserById(ctx, u.collection, id, bson.E{Key: "$set", Value: data})
}

// DeleteUserById deletes the user with the given id.
// If the user does not exist, [ErrNoUser] is returned.
func (u *userRepo) DeleteUserById(ctx context.Context, id string) error {
	_, err := updateUserById(ctx, u.collection, id, bson.E{Key: "$currentDate", Value: bson.D{{Key: "deleted_at", Value: true}}})
	return err
}

// findUser finds a user that matches the given filter.
func findUser(ctx context.Context, col *mongo.Collection, filter bson.E) (*models.User, error) {
	result := col.FindOne(ctx, bson.D{filter, {Key: "deleted_at", Value: nil}})
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

func updateUserById(ctx context.Context, col *mongo.Collection, id string, update bson.E) (*models.User, error) {
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	result := col.FindOneAndUpdate(ctx,
		bson.D{{Key: "_id", Value: objId}, {Key: "deleted_at", Value: nil}},
		bson.D{update, {Key: "$currentDate", Value: bson.D{{Key: "updated_at", Value: true}}}},
		options.FindOneAndUpdate().SetReturnDocument(options.After))

	if result.Err() != nil {
		return nil, result.Err()
	}

	var user models.User
	if err := result.Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}

func NewUserRepo(con *mongo.Database) UserRepo {
	return &userRepo{collection: con.Collection("user")}
}
