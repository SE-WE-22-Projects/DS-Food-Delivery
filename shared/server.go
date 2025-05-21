package shared

import (
	"context"
	"os"
	"os/signal"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/compress"
	"github.com/gofiber/fiber/v3/middleware/healthcheck"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"go.uber.org/zap"
)

const DefaultRateLimit = 60

// DefaultFiberConfig is the default fiber config used for servers.
var DefaultFiberConfig = fiber.Config{
	ErrorHandler:    middleware.ErrorHandler(),
	JSONDecoder:     middleware.UnmarshalJsonStrict,
	StructValidator: validate.New(),
}

// WithDefaultMiddleware registers default middleware for the server.
func WithDefaultMiddleware(app *fiber.App) *fiber.App {
	app.Use(middleware.Recover())
	app.Use("/health/livez", healthcheck.NewHealthChecker(healthcheck.Config{
		Probe: func(fiber.Ctx) bool {
			zap.L().Debug("Health check")
			return true
		},
	}))

	app.Use(compress.New())
	app.Use(limiter.New(limiter.Config{
		MaxFunc:           func(fiber.Ctx) int { return DefaultRateLimit },
		Max:               DefaultRateLimit,
		LimiterMiddleware: limiter.SlidingWindow{},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(dto.Error("Too many requests"))
		},
	}))

	return app
}

func AppContext() context.Context {
	shutdownCtx, shutdown := context.WithCancel(context.Background())
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		shutdown()
	}()

	return shutdownCtx
}
