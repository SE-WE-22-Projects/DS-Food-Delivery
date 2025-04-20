package restaurentservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/handlers/restaurent"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/repo"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	restaurentRepo := repo.NewRestaurentRepo(s.db.Database("restaurent-service"))

	{
		handler, err := restaurent.New(restaurentRepo, s.log)
		if err != nil {
			return err
		}

		group := s.app.Group("/restaurents/")
		// TODO: add auth middleware

		group.Get("/", handler.HandleGetAllRestaurents)
		group.Post("/", handler.HandleCreateRestaurent)
		group.Get("/:restaurentId", handler.HandleGetRestaurentById)
		group.Patch("/:restaurentId", handler.HandleUpdateRestaurent)
		group.Put("/:restaurentId/logo", handler.HandleUpdateLogoById)
		group.Put("/:restaurentId/cover", handler.HandleUpdateCoverById)
		group.Delete("/:restaurentId", handler.HandleDeleteRestaurentById)

	}

	return nil
}
