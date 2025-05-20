package app

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
)

// StartOAuth starts the oauth process
func (a *App) StartOAuth(login bool) string {
	url := a.oauth.StartOAuth(login)
	return url
}

// OAuthLogin handles a login using oauth.
func (a *App) OAuthLogin(ctx context.Context, code, state string, userIP, userAgent string) (*models.LoginResponse, error) {
	data, err := a.oauth.AuthCallback(ctx, code, state)
	if err != nil {
		return nil, err
	}

	user, err := a.users.FindUserByOauthID(ctx, "google", data.ID)
	if err != nil {
		return nil, err
	}

	return a.createSession(ctx, user, userIP, userAgent)
}

// OAuthLink handles linking an existing account to oauth identity
func (a *App) OAuthLink(ctx context.Context, userID string, code, state string) error {
	data, err := a.oauth.AuthCallback(ctx, code, state)
	if err != nil {
		return err
	}

	err = a.users.AddUserOauthID(ctx, userID, "google", data.ID)
	if err != nil {
		return err
	}

	return nil

}
