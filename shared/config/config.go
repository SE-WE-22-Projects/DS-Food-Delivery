package config

import (
	"log"
	"strings"

	"github.com/spf13/viper"
)

// Loads the config for the server
func LoadConfig[T any](opts ...viper.Option) (*T, error) {
	parser := viper.NewWithOptions(opts...)

	parser.SetConfigName("config.default")
	parser.SetConfigType("toml")
	parser.AddConfigPath(".")

	if err := parser.ReadInConfig(); err != nil {
		return nil, err
	}

	parser.SetConfigName("config")
	if err := parser.MergeInConfig(); err != nil {
		if _, ok := err.(*viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	// load config values from environment variables
	parser.AutomaticEnv()
	parser.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	var config T
	if err := parser.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}

// MustLoadConfig loads the config using [LoadConfig].
// If loading the config fails, calls [log.Fatal].
func MustLoadConfig[T any](opts ...viper.Option) *T {
	cfg, err := LoadConfig[T](opts...)
	if err != nil {
		if loadErr, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Fatal("Config not found", loadErr)
		} else {
			log.Fatal("Error while loading config", err)
		}
	}

	return cfg
}
