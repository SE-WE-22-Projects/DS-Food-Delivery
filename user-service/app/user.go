package app

import (
	"context"
	"crypto/rsa"
	"errors"
	"strings"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/oauth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

var ErrLogin = fiber.NewError(fiber.StatusBadRequest, "Incorrect username or password")

const TokenDuration = time.Minute * 30
const RefreshDuration = time.Hour * 24 * 60
const RefreshLeeway = time.Minute * 3

type App struct {
	oauth *oauth.OAuth
	key   *rsa.PrivateKey

	users     repo.UserRepo
	sessions  repo.SessionRepo
	driverReg repo.DriverApplicationRepo
}

func NewApp(client *mongo.Client, oauthCfg oauth.Config, key *rsa.PrivateKey) *App {
	database := client.Database("user-service")

	return &App{
		key:       key,
		oauth:     oauth.New(oauthCfg),
		sessions:  repo.NewSessionRepo(database),
		users:     repo.NewUserRepo(database),
		driverReg: repo.NewDriverRepo(database),
	}
}
func (a *App) UserRepo() repo.UserRepo { return a.users }

// GetAllUsers gets all users.
func (a *App) GetAllUsers(ctx context.Context) ([]models.User, error) {
	users, err := a.users.GetAllUsers(ctx)
	if err != nil {
		return nil, err
	}

	if len(users) == 0 {
		return []models.User{}, nil
	}

	return users, nil
}

// GetUser gets the user with the given id.
func (a *App) GetUser(ctx context.Context, userID string) (*models.User, error) {
	return a.users.GetUserByID(ctx, userID)
}

// UpdateUser updates the users details.
func (a *App) UpdateUser(ctx context.Context, userID string, data *models.UserUpdate) (*models.User, error) {
	if len(data.Password) > 0 {
		hashed, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}

		data.Password = string(hashed)
	}

	return a.users.UpdateUserByID(ctx, userID, data)
}

// CreateUser creates a new user.
func (a *App) CreateUser(ctx context.Context, data *models.User, byAdmin bool) (string, error) {
	// hash the user password
	hashed, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	data.Password = string(hashed)
	data.PasswordExpired = byAdmin

	return a.users.CreateUser(ctx, data)
}

// DeleteUser deletes the user with the given id.
func (a *App) DeleteUser(ctx context.Context, userID string) error {
	return a.users.DeleteUserByID(ctx, userID)
}

// GetUserProfileImage gets the profile image of the user.
// Returns an empty string if the user has no profile picture.
func (a *App) GetUserProfileImage(ctx context.Context, userID string) (string, error) {
	user, err := a.users.GetUserByID(ctx, userID)
	if err != nil {
		return "", err
	}

	if len(user.ProfileImage) > 0 && strings.HasPrefix(user.ProfileImage, "/api/v1/uploads/") {
		return user.ProfileImage, nil
	}

	return "", nil
}

// LoginWithPassword handles a user login using email and password
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
