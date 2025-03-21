package main

import (
	"context"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
)

type Config struct {
	Server struct {
		Port int
	}
	Database database.MongoConfig
	Logger   logger.Config
}

type Server struct {
	app *fiber.App
	log *zap.Logger
	cfg *Config
	db  *mongo.Client
}

// New creates a new server.
func New(cfg *Config, log *zap.Logger, db *mongo.Client) *Server {
	s := &Server{cfg: cfg, db: db, log: log}

	s.app = fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(log),
		JSONDecoder:  unmarshalJsonStrict,
	})

	return s
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	address := fmt.Sprintf(":%d", s.cfg.Server.Port)
	return s.app.Listen(address, fiber.ListenConfig{GracefulContext: ctx})
}
