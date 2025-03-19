package user

import (
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
)

type User struct {
	db repo.UserRepo
}

func New(userDB repo.UserRepo) (*User, error) {
	auth := &User{db: userDB}

	return auth, nil
}

func (a *User) GetUsers(c fiber.Ctx) error {
	users, err := a.db.GetAllUsers(c.RequestCtx())
	if err != nil {
		return nil
	}

	return c.Status(200).JSON(users)
}

func (a *User) AddUser(c fiber.Ctx) error {
	var req *models.CreateUser
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	userId, err := a.db.CreateUser(c.RequestCtx(), req)
	if err != nil {
		return err
	}

	return c.Status(201).JSON(fmt.Sprintf("Created %s", userId))
}

func (a *User) GetUser(c fiber.Ctx) error {
	userId := c.Params("userId")
	if len(userId) == 0 {
		return fiber.ErrBadRequest
	}

	user, err := a.db.GetUserById(c.RequestCtx(), userId)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(user)
}

func (a *User) DeleteUser(c fiber.Ctx) error {
	userId := c.Params("userId")
	if len(userId) == 0 {
		return fiber.ErrBadRequest
	}

	err := a.db.DeleteUserById(c.RequestCtx(), userId)
	if err != nil {
		return err
	}

	return c.SendStatus(204)
}
