package app

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"errors"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var ErrLogin = fiber.NewError(fiber.StatusBadRequest, "Incorrect username or password")

// TODO: TokenDuration should be 15 minutes
const TokenDuration = time.Hour * 72
const RefreshDuration = time.Hour * 24 * 60
const RefreshLeeway = time.Minute * 3

type App struct {
	users    repo.UserRepo
	sessions repo.SessionRepo
	key      *rsa.PrivateKey
}

func NewApp(repo repo.UserRepo, session repo.SessionRepo, key *rsa.PrivateKey) *App {
	return &App{users: repo, key: key, sessions: session}
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

	refresh := rand.Text()
	sessionID, err := a.sessions.CreateSession(ctx, &models.Session{
		UserID:    user.ID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(TokenDuration),
		Refresh:   refresh,
		UA:        req.UA,
		IP:        req.IP,
	})
	if err != nil {
		return nil, err
	}

	// TODO: role handling, session table, refresh token
	token, err := a.createToken(user, sessionID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := a.createRefresh(user, sessionID, refresh)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{User: user, Token: token, Refresh: refreshToken}, nil
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
		Roles:    append([]string{"user_admin"}, user.Roles...),
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
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(TokenDuration)),
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
