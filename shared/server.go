package shared

import (
	"context"
	"os"
	"os/signal"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
)

// DefaultFiberConfig is the default fiber config used for servers.
var DefaultFiberConfig = fiber.Config{
	ErrorHandler:    middleware.ErrorHandler(),
	JSONDecoder:     middleware.UnmarshalJsonStrict,
	StructValidator: validate.New(),
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
