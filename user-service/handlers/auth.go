package handlers

import (
	"slices"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/app"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/gofiber/fiber/v3"
)

type Auth struct {
	app *app.App
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=64"`
}

type refreshRequest struct {
	Refresh string `json:"refresh"`
}

// NewAuth creates a new user service.
func NewAuth(app *app.App) *Auth {
	handler := &Auth{app: app}
	return handler
}

// Register handles a user registration request
func (a *Auth) Register(c fiber.Ctx) error {
	var req models.UserCreate
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	userID, err := a.app.CreateUser(c.RequestCtx(), req.ToUser())
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(dto.NamedOk("userId", userID))
}

// Login handles a user login request
func (a *Auth) Login(c fiber.Ctx) error {
	var req loginRequest
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	userIP, userAgent := c.IP(), c.Get("user-agent")

	// copy ip and ua
	userIP = string(slices.Clone([]byte(userIP)))
	userAgent = string(slices.Clone([]byte(userAgent)))

	res, err := a.app.LoginWithPassword(c.RequestCtx(), models.LoginRequest{Email: req.Email, Password: req.Password, IP: userIP, UA: userAgent})
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(res))
}

// CheckSession checks if the user's current session is valid
func (a *Auth) CheckSession(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	valid, err := a.app.ValidSession(c.RequestCtx(), user)
	if err != nil {
		return err
	}

	if valid {
		return c.SendStatus(fiber.StatusNoContent)
	}
	return fiber.ErrForbidden
}

// RefreshSession refreshes the users session using a refresh token
func (a *Auth) RefreshSession(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	var req refreshRequest
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	userIP, userAgent := c.IP(), c.Get("user-agent")

	// copy ip and ua
	userIP = string(slices.Clone([]byte(userIP)))
	userAgent = string(slices.Clone([]byte(userAgent)))

	res, err := a.app.RefreshSession(c.RequestCtx(), user, req.Refresh, userIP, userAgent)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(res))
}
