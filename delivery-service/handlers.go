package orderservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/handlers"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"go.uber.org/zap"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	s.app.Use(middleware.Auth(s.key))
	db := s.db.Database("delivery-service")

	delivery, err := repo.NewDeliveryRepo(db)
	if err != nil {
		zap.L().Fatal("Failed to create cart repo", zap.Error(err))
	}

	{
		handler := handlers.NewDelivery(delivery)
		group := s.app.Group("delivery")

		group.Get("/new", handler.GetNearbyDeliveries)
		group.Get("/my", handler.GetMyDeliveries)
		group.Get("/:deliveryId", handler.GetDelivery)
		group.Post("/:deliveryId/claim", handler.ClaimDelivery)
		group.Post("/:deliveryId/pickup", handler.PickupOrder)
		group.Post("/:deliveryId/complete", handler.CompleteOrder)
	}

	{
		proto.RegisterDeliveryServiceServer(s.grpc, grpc.NewServer(delivery))
	}
	return nil
}
