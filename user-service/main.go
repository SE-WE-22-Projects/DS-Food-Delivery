package main

import (
	"context"
	"crypto/rsa"
	"crypto/x509"
	_ "embed"
	"encoding/pem"
	"log"
	"os"
	"os/signal"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/spf13/viper"
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
	config, err := config.LoadConfig[Config]()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Fatal("Config not found")
		} else {
			log.Fatal("Error while loading config", err)
		}
	}

	zapLog, err := logger.NewLogger(config.Logger)
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

	con, err := database.ConnectMongo(serverCtx, config.Database)
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
