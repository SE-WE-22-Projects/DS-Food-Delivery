package main

import (
	"fmt"
	"log"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/config"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/db"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/auth"
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

	con, err := db.Connect(config)
	if err != nil {
		log.Fatal("Failed to connect to the database", err)
	}

	app := fiber.New()

	// Define a route for the GET method on the root path '/'
	app.Get("/", func(c fiber.Ctx) error {
		// Send a string response to the client
		return c.SendString("Hello, World 👋!")
	})

	{
		service, err := auth.New(con)
		if err != nil {
			log.Fatal("Failed to initialize auth service", err)
		}

		app.Get("/user", service.GetUsers)
		app.Post("/user", service.AddUser)
	}

	log.Fatal(app.Listen(fmt.Sprintf(":%d", config.Server.Port)))
}
