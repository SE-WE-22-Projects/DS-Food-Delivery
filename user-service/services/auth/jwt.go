package auth

import (
	"crypto/rsa"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/golang-jwt/jwt/v5"
)

// CreateToken creates a jwt access token for the given user.
// The given rsa key is used to sign the token.
func CreateToken(key *rsa.PrivateKey, user *models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS512, middleware.TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 3)),
			NotBefore: jwt.NewNumericDate(time.Now()),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		UserId: user.ID.Hex(),
		// TODO: get from user
		Roles:    []string{"user_admin"},
		Username: user.Name,
	})

	tokenString, err := token.SignedString(key)

	return tokenString, err
}
