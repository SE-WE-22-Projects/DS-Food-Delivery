package userservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/application"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/auth"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/services/user"
	"github.com/gofiber/fiber/v3"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	userRepo := repo.NewUserRepo(s.db.Database("user-service"))

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
		service, err := auth.New(userRepo, s.key)
		if err != nil {
			return err
		}

		group := s.app.Group("/auth/")
		group.Post("/register", service.HandleRegister)
		group.Post("/login", service.HandleLogin)
	}

	{
		service := application.NewHandler(repo.NewDriverRepo(s.db.Database("user-service")))
		group := s.app.Group("/drivers/")

		adminGroup := group.Group("/applications", middleware.RequireRole("user_admin"))
		adminGroup.Get("/", middleware.RequireRole("user_admin"), service.HandleGetAll)
		adminGroup.Patch("/:appId", middleware.RequireRole("user_admin"), service.HandleApprove)

		userGroup := group.Group("/:userId/register")
		// Allow users to view and edit their own applications, require user_admin role to view and update all applications.
		userGroup.Use(middleware.RequireRoleFunc("user_admin", func(c fiber.Ctx, tc middleware.TokenClaims) bool {
			return c.Params("userId") == tc.UserId
		}))
		userGroup.Post("/", service.HandleCreate)
		userGroup.Get("/", service.HandleGetUserCurrent)
		userGroup.Delete("/", service.HandleUserWithdraw)
		userGroup.Patch("/", service.HandleCreate)
		userGroup.Get("/history", service.HandleGetAllByUser)
	}

	{
		proto.RegisterUserServiceServer(s.grpc, grpc.NewGRPC(userRepo))
	}

	return nil
}
