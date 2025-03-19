package auth

import (
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type Auth struct {
	db *mongo.Client
}

func New(db *mongo.Client) (*Auth, error) {
	auth := &Auth{db: db}

	return auth, nil
}

func (a *Auth) GetUsers(c fiber.Ctx) error {
	cursor, err := a.db.Database("user-service").Collection("users").Find(c.RequestCtx(), bson.D{})
	if err != nil {
		return err
	}

	var users []models.User
	err = cursor.All(c.RequestCtx(), &users)
	if err != nil {
		return nil
	}

	return c.JSON(users)
}

type UserRequest struct {
	Name     string `json:"name"`
	MobileNo string `json:"mobile"`
	Email    string `json:"email"`
	Address  string `json:"address"`
	// TODO: location data
}

func (a *Auth) AddUser(c fiber.Ctx) error {
	var req *UserRequest
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	result, err := a.db.Database("user-service").Collection("users").InsertOne(c.RequestCtx(), req)
	if err != nil {
		return err
	}

	return c.Status(201).JSON(fmt.Sprintf("Created %s", result.InsertedID))
}
