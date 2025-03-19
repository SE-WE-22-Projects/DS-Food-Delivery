package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/user"
	"github.com/gofiber/fiber/v3"
	"github.com/spf13/viper"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Fatal("Config not found")
		} else {
			log.Fatal("Error while loading config", err)
		}
	}

	serverCtx, shutdown := context.WithCancel(context.Background())
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		<-c
		log.Printf("Shutting down")
		shutdown()
	}()

	con, err := repo.Connect(serverCtx, config)
	if err != nil {
		log.Fatal("Failed to connect to the database", err)
	}

	defer con.Disconnect(context.Background())

	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(),
	})

	// Define a route for the GET method on the root path '/'
	app.Get("/", func(c fiber.Ctx) error {
		// Send a string response to the client
		return c.SendString("Hello, World 👋!")
	})

	{
		service, err := user.New(repo.NewUserRepo(con))
		if err != nil {
			log.Fatal("Failed to initialize auth service", err)
		}

		group := app.Group("/users/")

		group.Get("/", service.HandleGetUsers)
		group.Post("/", service.HandleAddUser)
		group.Get("/:userId", service.HandleGetUser)
		group.Delete("/:userId", service.HandleDeleteUser)
	}

	address := fmt.Sprintf(":%d", config.Server.Port)
	err = app.Listen(address, fiber.ListenConfig{GracefulContext: serverCtx})
	if err != nil {
		log.Fatal(err)
	}
}
