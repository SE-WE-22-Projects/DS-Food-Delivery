package user

import (
	"strings"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
	"golang.org/x/crypto/bcrypt"
)

// ErrUserNotFound is returned if the user for the given operation is not found.
var ErrUserNotFound = fiber.NewError(fiber.StatusNotFound, "User with the given id was not found")

// ErrNoUserID is returned when the user id is missing or invalid.
var ErrNoUserID = fiber.NewError(fiber.StatusBadRequest, "User id is not specified or is invalid")

// Maps errors returned by UserRepo to api errors.
var errorMap = map[error]error{
	repo.ErrInvalidID: ErrNoUserID,
	repo.ErrNoUser:    ErrUserNotFound,
}

type Handler struct {
	db       repo.UserRepo
	validate *validate.Validator
}

// New creates a new user handler.
func New(userDB repo.UserRepo) (*Handler, error) {
	handler := &Handler{db: userDB, validate: validate.New()}
	return handler, nil
}

// HandleGetUsers handles sending a list of all users.
func (a *Handler) HandleGetUsers(c fiber.Ctx) error {
	users, err := a.db.GetAllUsers(c.RequestCtx())
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: users})
}

// HandleAddUser handles adding a new user.
func (a *Handler) HandleAddUser(c fiber.Ctx) error {
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

	userID, err := a.db.CreateUser(c.RequestCtx(), user)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(dto.NamedOk("userId", userID))
}

// HandleAddUser handles adding a new user.
func (a *Handler) HandleUpdateUser(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return ErrNoUserID
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

	updated, err := a.db.UpdateUserByID(c.RequestCtx(), userID, req)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: fiber.Map{"user": updated, "message": "user updated successfully"}})
}

// HandleGetUserImage gets the user profile image
func (a *Handler) HandleGetUserImage(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return ErrNoUserID
	}

	user, err := a.db.GetUserByID(c.RequestCtx(), userID)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		return err
	}

	if len(user.ProfileImage) > 0 && strings.HasPrefix(user.ProfileImage, "/api/v1/uploads/") {
		return c.Redirect().Status(fiber.StatusFound).To(user.ProfileImage)
	}

	return c.Status(fiber.StatusNotFound).JSON(dto.Error("user does not have a profile image"))
}

// HandleUpdateUserImage updates the user profile image
func (a *Handler) HandleUpdateUserImage(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return ErrNoUserID
	}

	// TODO: actually handle uploading image
	var url *string
	err := c.Bind().Body(&url)
	if err != nil {
		return err
	}

	user, err := a.db.UpdateUserImage(c.RequestCtx(), userID, *url)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: fiber.Map{"message": "user image updated successfully", "user": user}})
}

// HandleUpdatePassword updates the user password
func (a *Handler) HandleUpdatePassword(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return ErrNoUserID
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

	err = a.db.UpdateUserPassword(c.RequestCtx(), userID, hashed)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: fiber.Map{"message": "user password updated successfully"}})
}

// HandleGetUser handles getting a user by the user id.
func (a *Handler) HandleGetUser(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return ErrNoUserID
	}

	user, err := a.db.GetUserByID(c.RequestCtx(), userID)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: user})
}

// HandleDeleteUser handles deleting a user with the given id.
func (a *Handler) HandleDeleteUser(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return ErrNoUserID
	}

	err := a.db.DeleteUserByID(c.RequestCtx(), userID)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		return err
	}

	return c.SendStatus(fiber.StatusNoContent)
}
