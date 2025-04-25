package restaurantservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/grpc"
	menuitem "github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/menuItem"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/handlers/restaurant"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/repo"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	restaurantRepo := repo.NewRestaurantRepo(s.db.Database("restaurant-service"))
	menuItemRepo := repo.NewMenItemRepo(s.db.Database("restaurant-service"))

	{
		handler, err := restaurant.New(restaurantRepo, s.log)
		if err != nil {
			return err
		}

		group := s.app.Group("/restaurants/")
		// TODO: add auth middleware

		group.Get("/all", handler.HandleGetAllRestaurants)
		group.Post("/", handler.HandleCreateRestaurant)
		group.Get("/:restaurantId", handler.HandleGetRestaurantById)
		group.Patch("/:restaurantId", handler.HandleUpdateRestaurant)
		group.Put("/:restaurantId/logo", handler.HandleUpdateLogoById)
		group.Put("/:restaurantId/cover", handler.HandleUpdateCoverById)
		group.Delete("/:restaurantId", handler.HandleDeleteRestaurantById)
		group.Patch("/:restaurantId/approve", handler.ApproveRestaurantById)
		group.Get("/", handler.HandleGetAllRestaurants)
	}

	{
		handler, err := menuitem.New(menuItemRepo, s.log)
		if err != nil {
			return err
		}

		group := s.app.Group("/menu/")
		// TODO: add auth middleware

		group.Get("/", handler.HandleGetAllMenuItems)
		group.Get("/restaurant/:restaurantId", handler.HandleGetResturanMenuItems)
		group.Get("/:menuItemId", handler.HandleDeleteMenuItemById)
		group.Post("/", handler.HandleCreateMenuItem)
		group.Patch("/:menuItemId", handler.HandleUpdaateMenuItemById)
		group.Patch("/:menuItemId/image", handler.HandleUpdaateMenuItemById)
		group.Delete("/:menuItemId", handler.HandleDeleteMenuItemById)
	}

	{
		proto.RegisterRestaurantServiceServer(s.grpc, grpc.New(restaurantRepo, menuItemRepo))
	}

	return nil
}
