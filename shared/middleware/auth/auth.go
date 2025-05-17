package auth

import (
	"crypto/rsa"
	"errors"
	"fmt"
	"slices"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

// prefix is the prefix used in the authorization header
const prefix = "Bearer "

// ErrNoToken is returned when there is no token in the request
var ErrNoToken = fiber.NewError(fiber.StatusUnauthorized, "Missing authorization token")

// ErrMalformedToken is returned when the token is missing or expired
var ErrMalformedToken = fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired authorization token")

// ErrPermission is returned by [Role] and [Permission] if the request does not have permission to access the url.
var ErrPermission = fiber.NewError(fiber.StatusForbidden, "You do not have permission to access this path")

// UserToken contains the claims contained in the jwt token.
type UserToken struct {
	jwt.RegisteredClaims
	// UserId the user id of the user
	UserId string `json:"uid"` //nolint: all
	// Roles the permission roles the user has
	Roles []string `json:"roles"`
	// Username is the display name for the user
	Username string `json:"username"`
	// Email is the email for the user
	Email string `json:"email"`
	// Session the user session
	Session string `json:"sessionID"`
}

type Config struct {
	// Key is the key to use for verifying tokens.
	// If this is nil, [config.LoadJWTVerifyKey]() is used.
	Key *rsa.PublicKey

	// Skip allows for urls to skip auth checks
	Skip func(c fiber.Ctx) bool
}

// New creates a new auth middleware.
func New(maybeConfig ...Config) fiber.Handler {
	var cfg Config
	if len(maybeConfig) > 0 {
		cfg = maybeConfig[0]
	}

	var err error
	if cfg.Key == nil {
		cfg.Key, err = config.LoadJWTVerifyKey()
		if err != nil {
			panic(fmt.Errorf("auth: Failed to load verify key: %w", err))
		}
	}

	parser := jwt.NewParser(
		jwt.WithValidMethods([]string{"RS512"}),
		jwt.WithExpirationRequired(),
		jwt.WithIssuedAt(),
	)

	return func(c fiber.Ctx) error {
		// get the auth token from the header
		header := c.Request().Header.Peek("Authorization")
		if len(header) < len(prefix) {
			if cfg.Skip != nil && cfg.Skip(c) {
				return c.Next()
			}

			// no token
			return ErrNoToken
		}

		// remove Bearer prefix
		tokenStr := string(header[len(prefix):])

		// parse and validate token
		var claim UserToken
		_, err := parser.ParseWithClaims(tokenStr, &claim, func(_ *jwt.Token) (any, error) { return cfg.Key, nil })
		if err != nil {
			if cfg.Skip != nil && cfg.Skip(c) {
				return c.Next()
			}

			if errors.Is(err, jwt.ErrTokenSignatureInvalid) || errors.Is(err, jwt.ErrTokenExpired) {
				return ErrMalformedToken
			}
			return err
		}

		// set the user value and call the next handler
		c.RequestCtx().SetUserValue("user", &claim)
		return c.Next()
	}
}

// Check a function to check if the user has permission to access the url.
// This should return true if the request has the correct permissions
type Check func(fiber.Ctx, UserToken) bool

// Role checks if the user has the required role.
func Role(role ...string) fiber.Handler {
	return requireRole(role, nil)
}

// Permission checks if the user has the required role or has permission for the url.
// The request is allowed if the user has the role or if hasPermission returns true.
func Permission(hasPermission Check, roles ...string) fiber.Handler {
	return requireRole(roles, hasPermission)
}

func requireRole(roles []string, hasPermission Check) fiber.Handler {
	return func(c fiber.Ctx) error {
		// get the request token from the fiber ctx.
		token := GetUser(c)
		if token == nil {
			return fiber.ErrUnauthorized
		}

		// check if the user has the role
		for _, role := range roles {
			if slices.Contains(token.Roles, role) {
				return c.Next()

			}
		}

		// check the permission if the permission function is given
		if hasPermission != nil && hasPermission(c, *token) {
			return c.Next()
		}

		return ErrPermission
	}
}

// GetUser returns the user token for the request.
// token contains the token associated with the request.
// It will be nil if there is no token or if it is invalid.
func GetUser(c fiber.Ctx) (token *UserToken) {
	token, ok := c.RequestCtx().UserValue("user").(*UserToken)
	if !ok {
		return nil
	}

	return token
}
