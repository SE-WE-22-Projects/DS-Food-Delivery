package handlers

import (
	"slices"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/app"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/app/oauth"
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

	userID, err := a.app.CreateUser(c.RequestCtx(), req.ToUser(), false)
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

	return a.sendLogin(c, res)
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
	refresh := c.Cookies("refresh")
	if len(refresh) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(dto.Error("No refresh token"))
	}

	userIP, userAgent := c.IP(), c.Get("user-agent")

	// copy ip and ua
	userIP = string(slices.Clone([]byte(userIP)))
	userAgent = string(slices.Clone([]byte(userAgent)))

	res, err := a.app.RefreshSession(c.RequestCtx(), refresh, userIP, userAgent)
	if err != nil {
		return err
	}

	return a.sendLogin(c, res)
}

// OAuthLogin handles starting the oauth login process.
func (a *Auth) OAuthLogin(c fiber.Ctx) error {
	oauthURL := a.app.StartOAuth(true)
	return c.Status(fiber.StatusOK).JSON(dto.NamedOk("url", oauthURL))
}

// OAuthLogin handles starting the oauth linking process.
func (a *Auth) OAuthLink(c fiber.Ctx) error {
	oauthURL := a.app.StartOAuth(false)
	return c.Status(fiber.StatusOK).JSON(dto.NamedOk("url", oauthURL))
}

// OAuthCallback handles an oauth callback
func (a *Auth) OAuthCallback(c fiber.Ctx) error {
	code := c.FormValue("code")
	state := c.FormValue("state")

	// check state to see if the callback is for login or account linking
	isLogin := oauth.IsLogin(state)

	if isLogin {
		userIP, userAgent := c.IP(), c.Get("user-agent")

		// copy ip and ua and code
		userIP = string(slices.Clone([]byte(userIP)))
		userAgent = string(slices.Clone([]byte(userAgent)))
		code = string(slices.Clone([]byte(code)))

		res, err := a.app.OAuthLogin(c.RequestCtx(), code, state, userIP, userAgent)
		if err != nil {
			return err
		}

		return a.sendLogin(c, res)
	}

	user := auth.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	userID := user.UserId
	err := a.app.OAuthLink(c.RequestCtx(), userID, code, state)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok("Linked successfully"))
}

// sendLogin sends a login response and sets the refresh cookie
func (a *Auth) sendLogin(c fiber.Ctx, res *models.LoginResponse) error {
	cookiePath := "/api/v1/auth/session/refresh"

	c.Cookie(&fiber.Cookie{
		Name:     "refresh",
		Value:    res.Refresh,
		Path:     cookiePath,
		SameSite: fiber.CookieSameSiteStrictMode,
		Secure:   true,
		HTTPOnly: true,
		Expires:  time.Now().Add(app.RefreshDuration),
	})

	return c.Status(fiber.StatusOK).JSON(dto.Ok(fiber.Map{"user": res.User, "token": res.Token}))
}
