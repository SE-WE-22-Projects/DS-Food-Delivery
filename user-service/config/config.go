package config

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/spf13/viper"
)

type Config struct {
	Server struct {
		Port int
	}
	Database database.MongoConfig
	Logger   logger.Config
}

// Loads the config for the server
func LoadConfig(opts ...viper.Option) (*Config, error) {
	parser := viper.NewWithOptions(opts...)

	// use default options if no options are given
	if len(opts) == 0 {
		parser.SetConfigName("config")
		parser.SetConfigType("toml")
		parser.AddConfigPath(".")
	}

	if err := parser.ReadInConfig(); err != nil {
		return nil, err
	}

	var config Config

	if err := parser.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
