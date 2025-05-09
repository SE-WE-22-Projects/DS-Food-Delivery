package userservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/app"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/handlers"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/handlers/application"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/handlers/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/handlers/user"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
)

func checkUserOwns(c fiber.Ctx, tc middleware.TokenClaims) bool {
	return c.Params("userId") == tc.UserId
}

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	userRepo := repo.NewUserRepo(s.db.Database("user-service"))
	sessionRepo := repo.NewSessionRepo(s.db.Database("user-service"))
	app := app.NewApp(s.cfg.OAuth, userRepo, sessionRepo, s.key)

	{
		service, err := user.New(userRepo)
		if err != nil {
			return err
		}

		group := s.app.Group("/users/")
		group.Use(middleware.Auth(&s.key.PublicKey))

		adminGroup := group.Group("/")
		adminGroup.Use(middleware.RequireRole("user_admin"))
		adminGroup.Get("/", service.HandleGetUsers)
		adminGroup.Post("/", service.HandleAddUser)

		userGroup := group.Group("/:userId")
		// Allow users to edit their own profiles, require user_admin role to edit other users.
		userGroup.Use(middleware.RequireRoleFunc(checkUserOwns, "user_admin"))
		userGroup.Get("/", service.HandleGetUser)
		userGroup.Patch("/", service.HandleUpdateUser)
		userGroup.Delete("/", service.HandleDeleteUser)
		userGroup.Get("/image", service.HandleGetUserImage)
		userGroup.Post("/image", service.HandleUpdateUserImage)
		userGroup.Post("/password", service.HandleUpdatePassword)
	}

	{
		handler := handlers.NewAuth(app)

		group := s.app.Group("/auth/")
		group.Post("/register", handler.Register)
		group.Post("/login", handler.Login)

		group.Get("/oauth/login", handler.OAuthLogin)
		group.Get("/oauth/callback", handler.OAuthCallback)

		userGroup := group.Group("/session")
		userGroup.Use(middleware.Auth(&s.key.PublicKey))
		userGroup.Get("/check", handler.CheckSession)
		userGroup.Post("/refresh", handler.RefreshSession)
	}

	{
		service := application.NewHandler(repo.NewDriverRepo(s.db.Database("user-service")))
		group := s.app.Group("/drivers/")

		adminGroup := group.Group("/applications", middleware.RequireRole("user_admin"))
		adminGroup.Get("/", middleware.RequireRole("user_admin"), service.HandleGetAll)
		adminGroup.Patch("/:appId", middleware.RequireRole("user_admin"), service.HandleApprove)

		userGroup := group.Group("/:userId/register")
		// Allow users to view and edit their own applications, require user_admin role to view and update all applications.
		userGroup.Use(middleware.RequireRoleFunc(checkUserOwns, "user_admin"))
		userGroup.Post("/", service.Create)
		userGroup.Get("/", service.GetUserCurrent)
		userGroup.Delete("/", service.WithdrawOwn)
		// TODO: implement this
		userGroup.Patch("/", service.Create)
		userGroup.Get("/history", service.GetAllByUser)
	}

	{
		proto.RegisterUserServiceServer(s.grpc, grpc.NewGRPC(userRepo))
	}

	return nil
}
