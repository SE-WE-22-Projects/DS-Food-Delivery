package main

import (
	"context"
	"log"
	"os"
	"os/signal"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	service "github.com/SE-WE-22-Projects/DS-Food-Delivery/upload-service"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func main() {
	// load config file
	cfg, err := config.LoadConfig[service.Config]()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			zap.L().Fatal("Config not found")
		} else {
			zap.L().Fatal("Error while loading config", zap.Error(err))
		}
	}

	// create the logger
	logger.SetupGlobalLogger(cfg.Logger)

	key, err := config.LoadJWTVerifyKey()
	if err != nil {
		log.Fatalf("Failed to load public key: %v", err)
	}

	serverCtx, shutdown := context.WithCancel(context.Background())
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		zap.L().Info("Shutting down server")
		shutdown()
	}()

	s := service.New(cfg, key)

	err = s.RegisterRoutes()
	if err != nil {
		zap.L().Fatal("Failed to register routes", zap.Error(err))
	}

	err = s.Start(serverCtx)
	if err != nil {
		zap.L().Fatal("Server error", zap.Error(err))
	}
}
