package main

import (
	"context"
	"log"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	service "github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service"
	"go.uber.org/zap"
)

func main() {
	ctx := shared.AppContext()

	// load cfg file
	cfg := config.MustLoadConfig[service.Config]()

	logger.SetupGlobalLogger(cfg.Logger)

	privateKey, err := config.LoadJWTSigningKey()
	if err != nil {
		log.Fatalf("Failed to load private key: %v", err)
	}

	con, err := database.ConnectMongo(ctx, cfg.Database)
	if err != nil {
		zap.L().Panic("Failed to connect to the database", zap.Error(err))
	}

	zap.L().Info("Connected to MongoDB successfully")
	defer con.Disconnect(context.Background()) //nolint: all

	server := service.New(cfg, con, privateKey)

	err = server.RegisterRoutes()
	if err != nil {
		zap.L().Fatal("Failed to register routes", zap.Error(err))
	}

	err = server.Start(ctx)
	if err != nil {
		zap.L().Fatal("Server error", zap.Error(err))
	}
}
