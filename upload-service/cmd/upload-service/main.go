package main

import (
	"context"
	"log"
	"os"
	"os/signal"

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
