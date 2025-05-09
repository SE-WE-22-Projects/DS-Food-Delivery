package app

import (
	"context"
	"crypto/rand"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

var ErrInvalidRefresh = fiber.NewError(fiber.StatusBadRequest, "Invalid refresh token")

func (a *App) ValidSession(ctx context.Context, user *middleware.TokenClaims) (bool, error) {
	return a.sessions.IsValidSession(ctx, user.UserId, user.Session)
}

func (a *App) RefreshSession(ctx context.Context, jwt *auth.TokenClaims, refresh, userIP, userAgent string) (*models.LoginResponse, error) {
	refreshToken, err := a.parseRefreshToken(refresh)
	if err != nil {
		zap.L().Warn("Invalid refresh", zap.Error(err))
		return nil, ErrInvalidRefresh
	}

	if refreshToken.User != jwt.UserId || refreshToken.Session != jwt.Session {
		_ = a.sessions.InvalidateSession(ctx, jwt.UserId, jwt.Session)
		return nil, ErrInvalidRefresh
	}

	success, err := a.sessions.UseSessionRefresh(ctx, jwt.UserId, jwt.Session, refreshToken.Refresh)
	if err != nil {
		return nil, err
	}

	if !success {
		_ = a.sessions.InvalidateSession(ctx, jwt.UserId, jwt.Session)
		return nil, ErrInvalidRefresh
	}

	user, err := a.users.GetUserByID(ctx, jwt.UserId)
	if err != nil {
		return nil, err
	}

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

	// TODO: role handling
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
