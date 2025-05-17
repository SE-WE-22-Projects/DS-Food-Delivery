package handlers

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/app"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/gofiber/fiber/v3"
)

type User struct {
	app *app.App
}

// NewUser creates a new user handler.
func NewUser(app *app.App) (*User, error) {
	handler := &User{app: app}
	return handler, nil
}

// HandleGetUsers handles sending a list of all users.
func (u *User) HandleGetUsers(c fiber.Ctx) error {
	users, err := u.app.GetAllUsers(c.RequestCtx())
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(users))
}

// HandleAddUser handles adding a new user.
func (u *User) HandleAddUser(c fiber.Ctx) error {
	var req *models.UserCreate
	err := c.Bind().Body(&req)
	if err != nil {
		return sendError(c, err)
	}

	userID, err := u.app.CreateUser(c.RequestCtx(), req.ToUser(), true)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(dto.NamedOk("userId", userID))
}

// HandleAddUser handles adding a new user.
func (u *User) HandleUpdateUser(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(dto.Error("User id is not specified or is invalid"))
	}

	var req *models.UserUpdate
	err := c.Bind().Body(&req)
	if err != nil {
		return sendError(c, err)
	}

	updated, err := u.app.UpdateUser(c.RequestCtx(), userID, req)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(fiber.Map{"user": updated, "message": "user updated successfully"}))
}

// HandleGetUserImage gets the user profile image
func (u *User) HandleGetUserImage(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(dto.Error("User id is not specified or is invalid"))
	}

	imgURL, err := u.app.GetUserProfileImage(c.RequestCtx(), userID)
	if err != nil {
		return sendError(c, err)
	}

	if len(imgURL) > 0 {
		return c.Redirect().Status(fiber.StatusFound).To(imgURL)
	}

	return c.Status(fiber.StatusNotFound).JSON(dto.Error("user does not have a profile image"))
}

// HandleGetUser handles getting a user by the user id.
func (u *User) HandleGetUser(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(dto.Error("User id is not specified or is invalid"))
	}

	user, err := u.app.GetUser(c.RequestCtx(), userID)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(user))
}

// HandleDeleteUser handles deleting a user with the given id.
func (u *User) HandleDeleteUser(c fiber.Ctx) error {
	// Get user id from the request
	userID := c.Params("userId")
	if len(userID) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(dto.Error("User id is not specified or is invalid"))
	}

	err := u.app.DeleteUser(c.RequestCtx(), userID)
	if err != nil {
		return sendError(c, err)
	}

	return c.SendStatus(fiber.StatusNoContent)
}
