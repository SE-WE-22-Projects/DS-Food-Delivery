package main

import (
	_ "embed"

	service "github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"go.uber.org/zap"
)

func main() {
	cfg := config.MustLoadConfig[service.Config]()

	logger.SetupGlobalLogger(cfg.Logger)

	serverCtx := shared.AppContext()

	con, err := database.ConnectMongo(serverCtx, cfg.Database)
	if err != nil {
		zap.L().Panic("Failed to connect to the database", zap.Error(err))
	}
	zap.L().Info("Connected to MongoDB successfully")

	defer con.Disconnect(serverCtx)

	s, err := service.New(cfg, con)
	if err != nil {
		zap.L().Fatal("Failed to setup server", zap.Error(err))
	}

	err = s.RegisterRoutes()
	if err != nil {
		zap.L().Fatal("Failed to register routes", zap.Error(err))
	}

	err = s.Start(serverCtx)
	if err != nil {
		zap.L().Fatal("Server error", zap.Error(err))
	}
}
