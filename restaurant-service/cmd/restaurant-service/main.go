package main

import (
	"context"
	"log"
	"os"
	"os/signal"

	service "github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func main() {
	cfg, err := config.LoadConfig[service.Config]()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Fatal("Config not found")
		} else {
			log.Fatal("Error while loading config", err)
		}
	}

	logger.SetupGlobalLogger(cfg.Logger)

	serverCtx, shutdown := context.WithCancel(context.Background())
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		zap.L().Info("Shutting down server")
		shutdown()
	}()

	con, err := database.ConnectMongo(serverCtx, cfg.Database)
	if err != nil {
		zap.L().Panic("Failed to connect to the database", zap.Error(err))
	}
	zap.L().Info("Connected to MongoDB successfully")

	defer con.Disconnect(context.Background())

	publicKey, err := config.LoadJWTVerifyKey()
	if err != nil {
		log.Fatalf("Failed to load public key: %v", err)
	}

	s := service.New(cfg, zap.L(), con, publicKey)

	err = s.RegisterRoutes()
	if err != nil {
		zap.L().Fatal("Failed to register routes", zap.Error(err))
	}

	err = s.Start(serverCtx)
	if err != nil {
		zap.L().Fatal("Server error", zap.Error(err))
	}
}
