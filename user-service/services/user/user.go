package user

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/validate"
	"github.com/gofiber/fiber/v3"
)

// ErrUserNotFound is returned if the user for the given operation is not found
var ErrUserNotFound = fiber.NewError(404, "User with the given id was not found")

// ErrNoUserId is returned when the user id is missing or invalid
var ErrNoUserId = fiber.NewError(400, "User id is not specified or is invalid")

// Maps errors returned by UserRepo to api errors.
var errorMap = map[error]error{
	repo.ErrInvalidId: ErrNoUserId,
	repo.ErrNoUser:    ErrUserNotFound,
}

type User struct {
	db       repo.UserRepo
	validate *validate.Validator
}

// New creates a new user service.
func New(userDB repo.UserRepo) (*User, error) {
	auth := &User{db: userDB, validate: validate.New()}
	validate.New()
	return auth, nil
}

// HandleGetUsers handles sending a list of all users.
func (a *User) HandleGetUsers(c fiber.Ctx) error {
	users, err := a.db.GetAllUsers(c.RequestCtx())
	if err != nil {
		return err
	}

	return c.Status(200).JSON(models.Response{Ok: true, Data: users})
}

// HandleAddUser handles adding a new user.
func (a *User) HandleAddUser(c fiber.Ctx) error {
	var req *models.CreateUser
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	// validate the request
	err = a.validate.Validate(req)
	if err != nil {
		return err
	}

	userId, err := a.db.CreateUser(c.RequestCtx(), req)
	if err != nil {
		return err
	}

	return c.Status(201).JSON(models.Response{Ok: true, Data: fiber.Map{"userId": userId}})
}

// HandleGetUser handles getting a user by the user id.
func (a *User) HandleGetUser(c fiber.Ctx) error {
	// Get user id from the request
	userId := c.Params("userId")
	if len(userId) == 0 {
		return ErrNoUserId
	}

	user, err := a.db.GetUserById(c.RequestCtx(), userId)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		return err
	}

	return c.Status(200).JSON(models.Response{Ok: true, Data: user})
}

// HandleDeleteUser handles deleting a user with the given id.
func (a *User) HandleDeleteUser(c fiber.Ctx) error {
	// Get user id from the request
	userId := c.Params("userId")
	if len(userId) == 0 {
		return ErrNoUserId
	}

	err := a.db.DeleteUserById(c.RequestCtx(), userId)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		return err
	}

	return c.SendStatus(204)
}
