package main

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"log"
	"os"
	"os/signal"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	service "github.com/SE-WE-22-Projects/DS-Food-Delivery/upload-service"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func loadKey() (*rsa.PrivateKey, error) {
	data, err := config.LoadSecret("jwt_private_key", "service.priv.key")
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return key, nil
}

func main() {
	// load config file
	config, err := config.LoadConfig[service.Config]()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Fatal("Config not found")
		} else {
			log.Fatal("Error while loading config", err)
		}
	}

	// create the logger
	zapLog, err := logger.NewLogger(config.Logger)
	if err != nil {
		log.Fatal("Error while creating logger", err)
	}
	zap.ReplaceGlobals(zapLog)

	privateKey, err := loadKey()
	if err != nil {
		log.Fatalf("Failed to load private key: %v", err)
	}

	serverCtx, shutdown := context.WithCancel(context.Background())
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		zapLog.Info("Shutting down server")
		shutdown()
	}()

	s := service.New(config, zapLog, privateKey)

	err = s.RegisterRoutes()
	if err != nil {
		zapLog.Panic("Failed to register routes", zap.Error(err))
	}

	err = s.Start(serverCtx)
	if err != nil {
		zapLog.Panic("Server error", zap.Error(err))
	}
}
