package middleware

import (
	"runtime/debug"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"go.uber.org/zap"
)

// Recover middleware recovers from any panics that occur when handing requests.
func Recover() fiber.Handler {
	return recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c fiber.Ctx, e any) {
			zap.L().Sugar().Errorf("Panic while handling request: %s\n %s", e, debug.Stack())
		},
	})
}
