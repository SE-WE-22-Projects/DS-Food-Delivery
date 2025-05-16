package restaurantservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/grpc"
	menuitem "github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/menuItem"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/restaurant"
	auth "github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"go.uber.org/zap"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	restaurantRepo := repo.NewRestaurantRepo(s.db.Database("restaurant-service"))
	menuItemRepo := repo.NewMenItemRepo(s.db.Database("restaurant-service"))
	authHandler := auth.NewAuth(restaurantRepo, menuItemRepo)

	auth := middleware.Auth(s.key)

	{
		handler, err := restaurant.New(restaurantRepo, zap.L(), s.cfg.Google.Key)
		if err != nil {
			return err
		}

		group := s.app.Group("/restaurants/")

		authGroup := group.Group("/")
		authGroup.Use(auth)
		authGroup.Post("/", handler.HandleCreateRestaurant)
		authGroup.Get("/owner", handler.HandleGetRestaurantsByOwnerId)

		group.Get("/", handler.HandleGetAllRestaurants)
		group.Get("/:restaurantId", handler.HandleGetRestaurantById)
		group.Get("/:restaurantId/logo", handler.HandleGetRestaurantLogoById)

		ownerGroup := group.Group("/:restaurantId")
		ownerGroup.Use(auth)
		ownerGroup.Use(middleware.RequireRoleFunc(authHandler.RestaurantPermissionFunc, "user_admin", "restaurant_admin"))
		ownerGroup.Patch("/", handler.HandleUpdateRestaurant)
		ownerGroup.Put("/logo", handler.HandleUpdateLogoById)
		ownerGroup.Put("/cover", handler.HandleUpdateCoverById)
		ownerGroup.Delete("/", handler.HandleDeleteRestaurantById)

		group.Patch("/:restaurantId/approve", handler.ApproveRestaurantById, middleware.RequireRole("user_admin", "restaurant_admin"))

		group.Get("/all", handler.HandleGetAllRestaurants, middleware.RequireRole("user_admin", "restaurant_admin"))
	}

	{
		handler, err := menuitem.New(menuItemRepo, zap.L())
		if err != nil {
			return err
		}

		group := s.app.Group("/menu/")
		group.Get("/", handler.HandleGetAllMenuItems)
		group.Get("/restaurant/:restaurantId", handler.HandleGetRestaurantMenuItems)
		group.Get("/:menuItemId", handler.HandleGetMenuItemById)

		group.Post("/", handler.HandleCreateMenuItem, auth)

		ownerGroup := group.Group("/:menuItemId")
		ownerGroup.Use(auth)
		ownerGroup.Use(middleware.RequireRoleFunc(authHandler.MenuPermissionFunc))
		ownerGroup.Patch("/", handler.HandleUpdateMenuItemById)
		ownerGroup.Patch("/image", handler.HandleUpdateMenuItemImageById)
		ownerGroup.Delete("/", handler.HandleDeleteMenuItemById)
	}

	{
		proto.RegisterRestaurantServiceServer(s.grpc, grpc.New(restaurantRepo, menuItemRepo))
	}

	return nil
}
