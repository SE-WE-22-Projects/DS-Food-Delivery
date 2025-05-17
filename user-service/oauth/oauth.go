package oauth

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type Config struct {
	Client   string
	Secret   string
	Redirect string
}

type OAuth struct {
	cfg       *oauth2.Config
	verifiers sync.Map
}

func New(cfg Config) *OAuth {
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

// StartOAuth starts the oauth process.
func (o *OAuth) StartOAuth(login bool) string {

	// create a unique state identifier to handle the callback
	state := rand.Text()
	if login {
		state = "LOGIN_" + state
	} else {
		state = "LINK_" + state
	}

	// create and store the code verifier
	// https://www.oauth.com/oauth2-servers/pkce/authorization-request/
	verifier := oauth2.GenerateVerifier()
	o.verifiers.Store(state, verifier)

	// create oauth url
	url := o.cfg.AuthCodeURL(state, oauth2.S256ChallengeOption(verifier))
	return url
}

// AuthCallback handles an oauth callback
func (o *OAuth) AuthCallback(ctx context.Context, code string, state string) (*models.GoogleResponse, error) {
	// check if the state is valid and get the verifier code.
	verifier, validState := o.verifiers.LoadAndDelete(state)
	if !validState {
		return nil, fmt.Errorf("invalid state code")
	}

	// send the oauth request
	token, err := o.cfg.Exchange(ctx, code, oauth2.VerifierOption(verifier.(string)))
	if err != nil {
		return nil, err
	}

	// get account details
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

// IsLogin returns if the oauth callback is for a login.
// If this returns false, the oauth callback is for linking an account.
func IsLogin(state string) bool {
	return strings.HasPrefix(state, "LOGIN_")
}
