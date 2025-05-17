package config

import (
	"log"
	"os"
	"strings"

	"github.com/go-viper/mapstructure/v2"
	"github.com/spf13/viper"
)

func loadFromEnv(v *viper.Viper) {
	for _, env := range os.Environ() {
		if !strings.HasPrefix(env, "APP_") {
			continue
		}

		kv := strings.SplitN(env, "=", 2)

		key := strings.ToLower(kv[0])
		key = strings.TrimPrefix(key, "app_")
		key = strings.ReplaceAll(key, "_", ".")

		value := kv[1]

		v.Set(key, value)
	}
}

// Loads the config for the server
func LoadConfig[T any](opts ...viper.Option) (*T, error) {
	parser := viper.NewWithOptions(opts...)

	parser.SetConfigName("config.default")
	parser.AddConfigPath(".")
	parser.SetConfigType("toml")

	if err := parser.ReadInConfig(); err != nil {
		return nil, err
	}

	parser.SetConfigName("config")
	if err := parser.MergeInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	// load config values from environment variables
	loadFromEnv(parser)

	var config T
	if err := parser.Unmarshal(&config, func(dc *mapstructure.DecoderConfig) {
		dc.ErrorUnset = true
	}); err != nil {
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
			log.Fatal(loadErr.Error())
		}
		log.Fatal("Error while loading config: ", err)
	}

	return cfg
}
