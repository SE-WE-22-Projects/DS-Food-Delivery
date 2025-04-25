package restaurantservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/grpc"
	menuitem "github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/menuItem"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/restaurant"
	auth "github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	restaurantRepo := repo.NewRestaurantRepo(s.db.Database("restaurant-service"))
	menuItemRepo := repo.NewMenItemRepo(s.db.Database("restaurant-service"))
	authHandler := auth.NewAuth(restaurantRepo, menuItemRepo)

	s.app.Use(middleware.Auth(s.key))

	{
		handler, err := restaurant.New(restaurantRepo, s.log)
		if err != nil {
			return err
		}

		group := s.app.Group("/restaurants/")

		group.Get("/", handler.HandleGetAllRestaurants)
		group.Post("/", handler.HandleCreateRestaurant)
		group.Get("/:restaurantId", handler.HandleGetRestaurantById)

		ownerGroup := group.Group("/:restaurantId")
		ownerGroup.Use(middleware.RequireRoleFunc(authHandler.RestaurantPermissionFunc))
		ownerGroup.Patch("/", handler.HandleUpdateRestaurant)
		ownerGroup.Put("/logo", handler.HandleUpdateLogoById)
		ownerGroup.Put("/cover", handler.HandleUpdateCoverById)
		ownerGroup.Delete("/", handler.HandleDeleteRestaurantById)

		group.Patch("/:restaurantId/approve", handler.ApproveRestaurantById, middleware.RequireRole("user_admin", "restaurant_admin"))

		group.Get("/all", handler.HandleGetAllRestaurants, middleware.RequireRole("user_admin", "restaurant_admin"))
	}

	{
		handler, err := menuitem.New(menuItemRepo, s.log)
		if err != nil {
			return err
		}

		group := s.app.Group("/menu/")
		group.Get("/", handler.HandleGetAllMenuItems)
		group.Get("/restaurant/:restaurantId", handler.HandleGetRestaurantMenuItems)
		group.Get("/:menuItemId", handler.HandleGetMenuItemById)

		ownerGroup := group.Group("/")
		ownerGroup.Use(middleware.RequireRoleFunc(authHandler.MenuPermissionFunc))
		ownerGroup.Post("/", handler.HandleCreateMenuItem)
		ownerGroup.Patch("/:menuItemId", handler.HandleUpdateMenuItemById)
		ownerGroup.Patch("/:menuItemId/image", handler.HandleUpdateMenuItemImageById)
		ownerGroup.Delete("/:menuItemId", handler.HandleDeleteMenuItemById)
	}

	{
		proto.RegisterRestaurantServiceServer(s.grpc, grpc.New(restaurantRepo, menuItemRepo))
	}

	return nil
}
