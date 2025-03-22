package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Config struct {
	// Dev controls the zap logger config to use.
	// If this is true, the development config will be used. Otherwise, the production config will be used.
	Dev bool
}

// NewLogger creates a new logger from the given config
func NewLogger(cfg Config) (*zap.Logger, error) {
	if !cfg.Dev {
		return zap.NewProduction()
	}

	encoderConf := zap.NewDevelopmentEncoderConfig()
	encoderConf.EncodeLevel = zapcore.CapitalColorLevelEncoder
	devCfg := zap.NewDevelopmentConfig()
	devCfg.EncoderConfig = encoderConf

	return devCfg.Build()
}
