package middleware

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware/auth"
)

// ErrNoToken is returned when there is no token in the request
// Deprecated: use middleware/auth
var ErrNoToken = auth.ErrNoToken

// ErrMalformedToken is returned when the token is missing or expired
// Deprecated: use middleware/auth
var ErrMalformedToken = auth.ErrMalformedToken

// ErrPermission is returned by [RequireRole] and [RequireRoleFunc] if the request does not have permission to access the url.
// Deprecated: use middleware/auth
var ErrPermission = auth.ErrPermission

// TokenClaims contains the claims contained in the jwt token.
// Deprecated: use middleware/auth
type TokenClaims = auth.TokenClaims

// the Auth middleware handles authenticating requests using the jwt token in the authorization header.
// The jwt token should be signed using the 'RS512' algorithm with the given key.
// Deprecated: use middleware/auth
var Auth = auth.Middleware

// PermissionFunc a function to check if the user has permission to access the url.
// This should return true if the request has the correct permissions
// Deprecated: use middleware/auth
type PermissionFunc auth.Check

// RequireRole checks if the user has the required role.
// Deprecated: use middleware/auth
var RequireRole = auth.RequireRole

// RequireRoleFunc checks if the user has the required role or has permission for the url.
// The request is allowed if the user has the role or if hasPermission returns true.
// Deprecated: use middleware/auth
var RequireRoleFunc = auth.RequireRoleFunc

// GetUser returns the user token for the request.
// token contains the token associated with the request.
// It will be nil if there is no token or if it is invalid.
// Deprecated: use middleware/auth
var GetUser = auth.GetUser
