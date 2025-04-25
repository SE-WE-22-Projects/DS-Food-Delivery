package middleware

import (
	"crypto/rsa"
	"errors"
	"slices"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

// prefix is the prefix used in the authorization header
const prefix = "Bearer "

// ErrNoToken is returned when there is no token in the request
var ErrNoToken = fiber.NewError(fiber.StatusUnauthorized, "Missing authorization token")

// ErrMalformedToken is returned when the token is missing or expired
var ErrMalformedToken = fiber.NewError(fiber.StatusUnauthorized, "Invalid or expired authorization token")

// ErrPermission is returned by [RequireRole] and [RequireRoleFunc] if the request does not have permission to access the url.
var ErrPermission = fiber.NewError(fiber.StatusForbidden, "You do not have permission to access this path")

// TokenClaims contains the claims contained in the jwt token.
type TokenClaims struct {
	jwt.RegisteredClaims
	// UserId the user id of the user
	UserId string `json:"uid"`
	// Roles the permission roles the user has
	Roles []string `json:"roles"`
	// Username is the display name for the user
	Username string `json:"username"`
}

// the Auth middleware handles authenticating requests using the jwt token in the authorization header.
// The jwt token should be signed using the 'RS512' algorithm with the given key.
func Auth(key *rsa.PublicKey) fiber.Handler {
	parser := jwt.NewParser(
		jwt.WithValidMethods([]string{"RS512"}),
		jwt.WithExpirationRequired(),
		jwt.WithIssuedAt(),
	)

	return func(c fiber.Ctx) error {
		// get the auth token from the header
		header := c.Request().Header.Peek("Authorization")
		if len(header) < len(prefix) {
			// no token
			return ErrNoToken
		}

		// remove Bearer prefix
		tokenStr := string(header[len(prefix):])

		// parse and validate token
		var claim TokenClaims
		_, err := parser.ParseWithClaims(tokenStr, &claim, func(token *jwt.Token) (any, error) {
			return key, nil
		})
		if err != nil {
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

// PermissionFunc a function to check if the user has permission to access the url.
// This should return true if the request has the correct permissions
type PermissionFunc func(fiber.Ctx, TokenClaims) bool

// RequireRole checks if the user has the required role.
func RequireRole(role ...string) fiber.Handler {
	return requireRole(role, nil)
}

// RequireRoleFunc checks if the user has the required role or has permission for the url.
// The request is allowed if the user has the role or if hasPermission returns true.
func RequireRoleFunc(hasPermission PermissionFunc, roles ...string) fiber.Handler {
	return requireRole(roles, hasPermission)
}

func requireRole(roles []string, hasPermission PermissionFunc) fiber.Handler {
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
func GetUser(c fiber.Ctx) (token *TokenClaims) {
	token, ok := c.RequestCtx().UserValue("user").(*TokenClaims)
	if !ok {
		return nil
	}

	return token
}
