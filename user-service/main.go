package main

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	_ "embed"
	"encoding/pem"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
)

var (
	privateKey *rsa.PrivateKey
)

//go:embed service.priv.key
var keyData []byte

func init() {
	var err error
	privateKey, err = loadKey(keyData)
	if err != nil {
		log.Fatalf("loadKey: %v", err)
	}
}

func loadKey(data []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(data)
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return key, nil
}

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

// New creates a new server.
func New(cfg *config.Config, log *zap.Logger, db *mongo.Client) *Server {
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
