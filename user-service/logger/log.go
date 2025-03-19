package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func NewLogger() (*zap.Logger, error) {
	encoderConf := zap.NewDevelopmentEncoderConfig()
	encoderConf.EncodeLevel = zapcore.CapitalColorLevelEncoder
	cfg := zap.NewDevelopmentConfig()
	cfg.EncoderConfig = encoderConf

	return cfg.Build()
}
