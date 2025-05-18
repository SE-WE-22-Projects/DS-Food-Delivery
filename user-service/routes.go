package userservice

import (
	"bytes"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/handlers"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/handlers/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/proto"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/redirect"
)

func checkUserOwns(c fiber.Ctx, tc middleware.TokenClaims) bool {
	return c.Params("userId") == tc.UserId
}

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	authMiddleware := auth.New(auth.Config{
		Skip: func(c fiber.Ctx) bool {
			path := c.Request().URI().Path()
			return bytes.HasPrefix(path, []byte("/auth/")) && string(path) != "/auth/oauth/link"
		},
	})

	s.fiber.Use(redirect.New(redirect.Config{
		Rules: map[string]string{
			"/api/v1/*": "/$1",
		},
	}))

	s.fiber.Use(authMiddleware)

	{
		handler, err := handlers.NewUser(s.app)
		if err != nil {
			return err
		}

		group := s.fiber.Group("/users/")

		adminGroup := group.Group("/")
		adminGroup.Use(middleware.RequireRole("user_admin"))
		adminGroup.Get("/", handler.HandleGetUsers)
		adminGroup.Post("/", handler.HandleAddUser)

		userGroup := group.Group("/:userId")
		// Allow users to edit their own profiles, require user_admin role to edit other users.
		userGroup.Use(middleware.RequireRoleFunc(checkUserOwns, "user_admin"))
		userGroup.Get("/", handler.HandleGetUser)
		userGroup.Patch("/", handler.HandleUpdateUser)
		userGroup.Delete("/", handler.HandleDeleteUser)
		userGroup.Get("/image", handler.HandleGetUserImage)
	}

	{
		handler := handlers.NewAuth(s.app)

		group := s.fiber.Group("/auth/")
		group.Post("/register", handler.Register)
		group.Post("/login", handler.Login)

		group.Get("/oauth/login", handler.OAuthLogin)
		group.Get("/oauth/callback", handler.OAuthCallback)

		group.Get("/session/check", handler.CheckSession)
		group.Post("/session/refresh", handler.RefreshSession)

		group.Get("/oauth/link", handler.OAuthLink)
	}

	{
		handler := handlers.NewApplication(s.app)
		group := s.fiber.Group("/drivers/")

		adminGroup := group.Group("/", middleware.RequireRole("user_admin"))
		adminGroup.Get("/", handler.HandleGetAllDrivers)
		adminGroup.Get("/applications/", handler.HandleGetAll)
		adminGroup.Get("/applications/:appId", handler.HandleGetByID)
		adminGroup.Patch("/applications/:appId", handler.HandleApproveApp)

		userGroup := group.Group("/:userId/register")
		// Allow users to view and edit their own applications, require user_admin role to view and update all applications.
		userGroup.Use(middleware.RequireRoleFunc(checkUserOwns, "user_admin"))
		userGroup.Post("/", handler.CreateDriverApp)
		userGroup.Get("/", handler.GetUserAppCurrent)
		userGroup.Delete("/", handler.WithdrawOwnApp)
		// TODO: implement this
		userGroup.Patch("/", handler.CreateDriverApp)
		userGroup.Get("/history", handler.GetAllAppsByUser)
	}

	{
		proto.RegisterUserServiceServer(s.grpc, grpc.NewGRPC(s.app.UserRepo()))
	}

	return nil
}
