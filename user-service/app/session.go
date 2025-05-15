package app

import (
	"context"
	"crypto/rand"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

var ErrInvalidRefresh = fiber.NewError(fiber.StatusBadRequest, "Invalid refresh token")

// ValidSession returns if the user's current session is valid.
// This is used to detect session invalidations due to logout and session timeout.
func (a *App) ValidSession(ctx context.Context, user *middleware.TokenClaims) (bool, error) {
	return a.sessions.IsValidSession(ctx, user.UserId, user.Session)
}

// RefreshSession refreshes the users session using the given refresh token.
// Returns a new session if the refresh token is valid. If the token is invalid, the current session is invalidated.
func (a *App) RefreshSession(ctx context.Context, refresh, userIP, userAgent string) (*models.LoginResponse, error) {
	refreshToken, err := a.parseRefreshToken(refresh)
	if err != nil {
		zap.L().Warn("Invalid refresh", zap.Error(err))
		return nil, ErrInvalidRefresh
	}

	success, err := a.sessions.UseSessionRefresh(ctx, refreshToken.User, refreshToken.Session, refreshToken.Refresh)
	if err != nil {
		return nil, err
	}

	if !success {
		// _ = a.sessions.InvalidateSession(ctx, refreshToken.User, refreshToken.Session)
		return nil, ErrInvalidRefresh
	}

	user, err := a.users.GetUserByID(ctx, refreshToken.User)
	if err != nil {
		return nil, err
	}

	return a.createSession(ctx, user, userIP, userAgent)
}

// createSession creates a session, access token and a refresh token.
func (a *App) createSession(ctx context.Context, user *models.User, userIP, userAgent string) (*models.LoginResponse, error) {
	newRefresh := rand.Text()
	sessionID, err := a.sessions.CreateSession(ctx, &models.Session{
		UserID:    user.ID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(TokenDuration),
		Refresh:   newRefresh,
		UA:        userAgent,
		IP:        userIP,
	})
	if err != nil {
		return nil, err
	}
	user.Roles = append(user.Roles, "user_admin", "user_driver", "user_owner")

	token, err := a.createToken(user, sessionID)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := a.createRefresh(user, sessionID, newRefresh)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{User: user, Token: token, Refresh: newRefreshToken}, nil
}

// createToken creates a jwt access token for the given user.
func (a *App) createToken(user *models.User, sessionID string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS512, middleware.TokenClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(TokenDuration)),
			NotBefore: jwt.NewNumericDate(time.Now()),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		Session: sessionID,
		UserId:  user.ID.Hex(),
		// FIXME: actual role handling in db
		Roles:    user.Roles,
		Username: user.Name,
	})

	return token.SignedString(a.key)
}

type refreshToken struct {
	jwt.RegisteredClaims
	User    string `json:"user"`
	Session string `json:"session"`
	Refresh string `json:"refresh"`
}

// createRefreshToken creates a jwt refresh token for the given user.
func (a *App) createRefresh(user *models.User, sessionID string, refresh string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS512, refreshToken{
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(RefreshDuration)),
			NotBefore: jwt.NewNumericDate(time.Now().Add(TokenDuration)),
		},
		User:    user.ID.Hex(),
		Session: sessionID,
		Refresh: refresh,
	})

	return token.SignedString(a.key)
}

func (a *App) parseRefreshToken(str string) (refresh *refreshToken, err error) {
	var claim refreshToken
	_, err = jwt.ParseWithClaims(str, &claim,
		func(_ *jwt.Token) (any, error) { return &a.key.PublicKey, nil },
		jwt.WithExpirationRequired(),
		jwt.WithIssuedAt(),
		jwt.WithValidMethods([]string{jwt.SigningMethodRS512.Name}),
		jwt.WithLeeway(RefreshLeeway),
	)

	if err != nil {
		return nil, err
	}

	return &claim, nil
}
