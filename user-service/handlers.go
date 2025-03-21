package main

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/user"
	"github.com/gofiber/fiber/v3"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	{
		service, err := user.New(repo.NewUserRepo(s.db))
		if err != nil {
			return err
		}

		group := s.app.Group("/users/")
		group.Use(middleware.Auth(&privateKey.PublicKey))

		adminGroup := group.Group("/")
		adminGroup.Use(middleware.RequireRole("user_admin"))
		adminGroup.Get("/", service.HandleGetUsers)
		adminGroup.Post("/", service.HandleAddUser)

		userGroup := group.Group("/:userId")
		// Allow users to edit their own profiles, require user_admin role to edit other users.
		userGroup.Use(middleware.RequireRoleFunc("user_admin", func(c fiber.Ctx, tc middleware.TokenClaims) bool {
			return c.Params("userId") == tc.UserId
		}))
		userGroup.Get("/", service.HandleGetUser)
		userGroup.Patch("/", service.HandleUpdateUser)
		userGroup.Delete("/", service.HandleDeleteUser)
		userGroup.Get("/image", service.HandleGetUserImage)
		userGroup.Post("/image", service.HandleUpdateUserImage)
		userGroup.Post("/password", service.HandleUpdatePassword)
	}

	{
		service, err := auth.New(repo.NewUserRepo(s.db), privateKey)
		if err != nil {
			return err
		}

		group := s.app.Group("/auth/")
		group.Post("/register", service.HandleRegister)
		group.Post("/login", service.HandleLogin)
	}

	return nil
}
