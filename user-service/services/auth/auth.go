package auth

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/binary"
	"errors"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/validate"
	"github.com/gofiber/fiber/v3"
	"golang.org/x/crypto/bcrypt"
)

type Auth struct {
	db       repo.UserRepo
	validate *validate.Validator
	key      *rsa.PrivateKey
}

// New creates a new user service.
func New(userDB repo.UserRepo, key *rsa.PrivateKey) (*Auth, error) {
	auth := &Auth{db: userDB, validate: validate.New(), key: key}
	validate.New()
	return auth, nil
}

const verifyChars = "ABCDEFGHKLMNPQJRSTUVWXYZ23456789"

// generateToken generates a 6 character verification token to verify an email/phone number.
func generateToken() string {
	var b [4]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}

	value := int32(binary.LittleEndian.Uint32(b[:]))

	var token [6]byte
	for i := range 6 {
		token[i] = verifyChars[value&31]
		value >>= 5
	}

	return string(token[:])
}

func (a *Auth) HandleRegister(c fiber.Ctx) error {
	var req *models.UserCreate
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	// validate the request
	err = a.validate.Validate(req)
	if err != nil {
		return err
	}

	user := req.ToUser()

	user.Verify = &models.Verification{
		Code:     generateToken(),
		Expires:  time.Now().Add(time.Hour * 3),
		Created:  time.Now(),
		Attempts: 3,
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashed)

	userId, err := a.db.CreateUser(c.RequestCtx(), user)
	if err != nil {
		return err
	}

	return c.Status(201).JSON(models.Response{Ok: true, Data: fiber.Map{"userId": userId}})
}

type loginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=64"`
}

func (a *Auth) HandleLogin(c fiber.Ctx) error {
	var req *loginRequest
	err := c.Bind().Body(&req)
	if err != nil {
		return err
	}

	// validate the request
	err = a.validate.Validate(req)
	if err != nil {
		return err
	}

	user, err := a.db.FindUserByEmail(c.RequestCtx(), req.Email)
	if err != nil {
		if errors.Is(err, repo.ErrNoUser) {
			return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{Ok: false, Error: "Incorrect username or password"})
		}
		return err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return c.Status(fiber.StatusUnauthorized).JSON(models.ErrorResponse{Ok: false, Error: "Incorrect username or password"})
		}
		return err
	}

	// TODO: role handling, session table, refresh token
	token, err := CreateToken(a.key, user)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: fiber.Map{"user": user, "token": token}})
}
