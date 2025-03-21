package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/user"
	"github.com/gofiber/fiber/v3"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Fatal("Config not found")
		} else {
			log.Fatal("Error while loading config", err)
		}
	}

	zapLog, err := logger.NewLogger()
	if err != nil {
		log.Fatal("Error while creating logger", err)
	}

	serverCtx, shutdown := context.WithCancel(context.Background())
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		zapLog.Info("Shutting down server")
		shutdown()
	}()

	con, err := repo.Connect(serverCtx, config)
	if err != nil {
		zapLog.Panic("Failed to connect to the database", zap.Error(err))
	}

	defer con.Disconnect(context.Background())

	s := New(config, zapLog, con)

	err = s.RegisterRoutes()
	if err != nil {
		zapLog.Panic("Failed to register routes", zap.Error(err))
	}

	err = s.Start(serverCtx)
	if err != nil {
		zapLog.Panic("Server error", zap.Error(err))
	}
}

type Server struct {
	app *fiber.App
	log *zap.Logger
	cfg *config.Config
	db  *mongo.Client
}

func unmarshalJsonStrict(data []byte, v any) error {
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.DisallowUnknownFields()
	err := decoder.Decode(v)
	if err != nil {

		var syntaxError *json.SyntaxError
		if errors.As(err, &syntaxError) {
			msg := fmt.Sprintf("Request JSON has a syntax error (at position %d)", syntaxError.Offset)
			return fiber.NewError(fiber.StatusBadRequest, msg)
		}

		var unmarshalTypeError *json.UnmarshalTypeError
		if errors.As(err, &unmarshalTypeError) {
			msg := fmt.Sprintf("Incorrect data type for field %q (at position %d) expected %s", unmarshalTypeError.Field, unmarshalTypeError.Offset, unmarshalTypeError.Type.Name())
			return fiber.NewError(fiber.StatusBadRequest, msg)
		}

		if strings.HasPrefix(err.Error(), "json: unknown field ") {
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			msg := fmt.Sprintf("Request body contains  field %s", fieldName)
			return fiber.NewError(fiber.StatusBadRequest, msg)
		}
	}
	return err
}

// New creates a new server.
func New(cfg *config.Config, log *zap.Logger, db *mongo.Client) *Server {
	s := &Server{cfg: cfg, db: db, log: log}

	s.app = fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(log),
		JSONDecoder:  unmarshalJsonStrict,
	})

	return s
}

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	{
		service, err := user.New(repo.NewUserRepo(s.db))
		if err != nil {
			return err
		}

		group := s.app.Group("/users/")
		group.Get("/", service.HandleGetUsers)
		group.Post("/", service.HandleAddUser)
		group.Get("/:userId", service.HandleGetUser)
		group.Patch("/:userId", service.HandleUpdateUser)
		group.Delete("/:userId", service.HandleDeleteUser)
		group.Get("/:userId/image", service.HandleGetUserImage)
		group.Post("/:userId/image", service.HandleUpdateUserImage)
		group.Post("/:userId/password", service.HandleUpdatePassword)
	}

	{
		service, err := auth.New(repo.NewUserRepo(s.db))
		if err != nil {
			return err
		}

		group := s.app.Group("/auth/")
		group.Post("/register", service.HandleRegister)

	}

	return nil
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	address := fmt.Sprintf(":%d", s.cfg.Server.Port)
	return s.app.Listen(address, fiber.ListenConfig{GracefulContext: ctx})
}
