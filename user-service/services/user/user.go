package user

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
	"golang.org/x/crypto/bcrypt"
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
	var req *models.UserCreate
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	// validate the request
	err = a.validate.Validate(req)
	if err != nil {
		return err
	}

	user := req.ToUser()

	// mark the password as expired for users created by admin
	user.PasswordExpired = true

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashed)

	userId, err := a.db.CreateUser(c.RequestCtx(), user)
	if err != nil {
		return err
	}

	return c.Status(201).JSON(models.Response{Ok: true, Data: fiber.Map{"userId": userId}})
}

// HandleAddUser handles adding a new user.
func (a *User) HandleUpdateUser(c fiber.Ctx) error {
	// Get user id from the request
	userId := c.Params("userId")
	if len(userId) == 0 {
		return ErrNoUserId
	}

	var req *models.UserUpdate
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	// validate the request
	err = a.validate.Validate(req)
	if err != nil {
		return err
	}

	updated, err := a.db.UpdateUserById(c.RequestCtx(), userId, req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: fiber.Map{"user": updated, "message": "user updated successfully"}})
}

// HandleGetUserImage gets the user profile image
func (a *User) HandleGetUserImage(c fiber.Ctx) error {
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

	if len(user.ProfileImage) > 0 {
		// TODO: validate the url before redirecting
		return c.Redirect().Status(fiber.StatusFound).To("https://" + user.ProfileImage)
	}

	return c.Status(404).JSON(models.ErrorResponse{Ok: false, Error: "user does not have a profile image"})
}

// HandleUpdateUserImage updates the user profile image
func (a *User) HandleUpdateUserImage(c fiber.Ctx) error {
	// Get user id from the request
	userId := c.Params("userId")
	if len(userId) == 0 {
		return ErrNoUserId
	}

	// TODO: actually handle uploading image
	var url *string
	err := c.Bind().Body(&url)
	if err != nil {
		return err
	}

	user, err := a.db.UpdateUserImage(c.RequestCtx(), userId, *url)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: fiber.Map{"message": "user image updated successfully", "user": user}})
}

// HandleUpdatePassword updates the user password
func (a *User) HandleUpdatePassword(c fiber.Ctx) error {
	// Get user id from the request
	userId := c.Params("userId")
	if len(userId) == 0 {
		return ErrNoUserId
	}

	// TODO: actually handle uploading image
	var req models.UserPassword
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	err = a.db.UpdateUserPassword(c.RequestCtx(), userId, hashed)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: fiber.Map{"message": "user password updated successfully"}})
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
