package config

import (
	"strings"

	"github.com/spf13/viper"
)

// Loads the config for the server
func LoadConfig[T any](opts ...viper.Option) (*T, error) {
	parser := viper.NewWithOptions(opts...)

	// use default options if no options are given
	if len(opts) == 0 {
		parser.SetConfigName("config")
		parser.SetConfigType("toml")
		parser.AddConfigPath(".")
	}

	// load config values from environment variables
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := parser.ReadInConfig(); err != nil {
		return nil, err
	}

	var config T
	if err := parser.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
