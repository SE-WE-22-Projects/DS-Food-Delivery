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

// SetupGlobalLogger sets up the global logger.
// This method calls os.Exit(1) if setting up the logger fails.
func SetupGlobalLogger(cfg Config) *zap.Logger {
	logger, err := NewLogger(cfg)
	if err != nil {
		zap.L().Fatal("Failed to create logger", zap.Error(err))
	}

	zap.ReplaceGlobals(logger)
	return logger
}
