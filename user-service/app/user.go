package app

import (
	"context"
	"crypto/rsa"
	"errors"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
	"golang.org/x/crypto/bcrypt"
)

var ErrLogin = fiber.NewError(fiber.StatusBadRequest, "Incorrect username or password")

// TODO: TokenDuration should be 15 minutes
const TokenDuration = time.Hour * 72
const RefreshDuration = time.Hour * 24 * 60
const RefreshLeeway = time.Minute * 3

type App struct {
	oauth    *auth.OAuth
	users    repo.UserRepo
	sessions repo.SessionRepo
	key      *rsa.PrivateKey
}

func NewApp(oauth auth.OAuthConfig, repo repo.UserRepo, session repo.SessionRepo, key *rsa.PrivateKey) *App {
	return &App{users: repo, key: key, sessions: session, oauth: auth.New(oauth)}
}

func (a *App) CreateUser(ctx context.Context, data *models.User) (string, error) {
	// hash the user password
	hashed, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	data.Password = string(hashed)

	return a.users.CreateUser(ctx, data)
}

func (a *App) LoginWithPassword(ctx context.Context, req models.LoginRequest) (res *models.LoginResponse, err error) {
	user, err := a.users.FindUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, repo.ErrNoUser) {
			return nil, ErrLogin
		}
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return nil, ErrLogin
		}
		return nil, err
	}

	return a.createSession(ctx, user, req.IP, req.UA)
}
