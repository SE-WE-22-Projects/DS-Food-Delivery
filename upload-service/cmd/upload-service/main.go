package main

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	service "github.com/SE-WE-22-Projects/DS-Food-Delivery/upload-service"
	"go.uber.org/zap"
)

func main() {
	// load config file
	cfg := config.MustLoadConfig[service.Config]()

	// create the logger
	logger.SetupGlobalLogger(cfg.Logger)

	s, err := service.New(cfg)
	if err != nil {
		zap.L().Fatal("Failed to create server", zap.Error(err))
	}

	err = s.RegisterRoutes()
	if err != nil {
		zap.L().Fatal("Failed to register routes", zap.Error(err))
	}

	err = s.Start(shared.AppContext())
	if err != nil {
		zap.L().Fatal("Server error", zap.Error(err))
	}
}
