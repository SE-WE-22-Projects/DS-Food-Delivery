package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type OAuthConfig struct {
	Client   string
	Secret   string
	Redirect string
}

type OAuth struct {
	cfg *oauth2.Config
}

func New(cfg OAuthConfig) *OAuth {
	return &OAuth{
		cfg: &oauth2.Config{
			ClientID:     cfg.Client,
			ClientSecret: cfg.Secret,
			RedirectURL:  cfg.Redirect,
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
			},
			Endpoint: google.Endpoint,
		},
	}
}

func (o *OAuth) StartOAuth() string {
	url := o.cfg.AuthCodeURL("state")

	return url
}

func (o *OAuth) AuthCallback(ctx context.Context, code string) (*models.GoogleResponse, error) {
	token, err := o.cfg.Exchange(ctx, code)
	if err != nil {
		return nil, err
	}

	reqURL, err := url.Parse("https://www.googleapis.com/oauth2/v1/userinfo")
	if err != nil {
		return nil, err
	}

	res := &http.Request{
		Method: "GET",
		URL:    reqURL,
		Header: map[string][]string{
			"Authorization": {fmt.Sprintf("Bearer %s", token.AccessToken)},
		},
	}
	req, err := http.DefaultClient.Do(res)
	if err != nil {
		return nil, err
	}
	defer req.Body.Close()

	body, err := io.ReadAll(req.Body)
	if err != nil {
		return nil, err
	}

	var data models.GoogleResponse
	err = json.Unmarshal(body, &data)
	if err != nil {
		return nil, err
	}

	return &data, nil
}
