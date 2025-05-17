package userservice

import (
	"bytes"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/app"
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
	app := app.NewApp(s.db, s.cfg.OAuth, s.key)

	authMiddleware := auth.New(auth.Config{
		Skip: func(c fiber.Ctx) bool {
			path := c.Request().URI().Path()
			return bytes.HasPrefix(path, []byte("/auth/")) && string(path) != "/auth/oauth/link"
		},
	})

	s.app.Use(redirect.New(redirect.Config{
		Rules: map[string]string{
			"/api/v1/*": "/$1",
		},
	}))

	s.app.Use(authMiddleware)

	{
		handler, err := handlers.NewUser(app)
		if err != nil {
			return err
		}

		group := s.app.Group("/users/")

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
		handler := handlers.NewAuth(app)

		group := s.app.Group("/auth/")
		group.Post("/register", handler.Register)
		group.Post("/login", handler.Login)

		group.Get("/oauth/login", handler.OAuthLogin)
		group.Get("/oauth/callback", handler.OAuthCallback)

		group.Get("/session/check", handler.CheckSession)
		group.Post("/session/refresh", handler.RefreshSession)

		group.Get("/oauth/link", handler.OAuthLink)
	}

	{
		handler := handlers.NewApplication(app)
		group := s.app.Group("/drivers/")

		adminGroup := group.Group("/applications", middleware.RequireRole("user_admin"))
		adminGroup.Get("/", middleware.RequireRole("user_admin"), handler.HandleGetAll)
		adminGroup.Patch("/:appId", middleware.RequireRole("user_admin"), handler.HandleApprove)

		userGroup := group.Group("/:userId/register")
		// Allow users to view and edit their own applications, require user_admin role to view and update all applications.
		userGroup.Use(middleware.RequireRoleFunc(checkUserOwns, "user_admin"))
		userGroup.Post("/", handler.Create)
		userGroup.Get("/", handler.GetUserCurrent)
		userGroup.Delete("/", handler.WithdrawOwn)
		// TODO: implement this
		userGroup.Patch("/", handler.Create)
		userGroup.Get("/history", handler.GetAllByUser)
	}

	{
		proto.RegisterUserServiceServer(s.grpc, grpc.NewGRPC(app.UserRepo()))
	}

	return nil
}
