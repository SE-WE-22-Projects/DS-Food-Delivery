package app

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
)

func (a *App) StartOAuth() string {
	url := a.oauth.StartOAuth()
	return url
}

func (a *App) AuthCallback(ctx context.Context, code string, userIP, userAgent string) (*models.LoginResponse, error) {
	data, err := a.oauth.AuthCallback(ctx, code)
	if err != nil {
		return nil, err
	}

	user, err := a.users.FindUserByEmail(ctx, data.Email)
	if err != nil {
		return nil, err
	}

	return a.createSession(ctx, user, userIP, userAgent)
}
