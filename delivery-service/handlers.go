package orderservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/handlers"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware/auth"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {

	s.fiber.Use(auth.New())
	{
		handler := handlers.NewDelivery(s.app)
		group := s.fiber.Group("delivery")

		group.Get("/new", handler.GetNearbyDeliveries)
		group.Get("/my", handler.GetMyDeliveries)
		group.Get("/:deliveryId", handler.GetDelivery)
		group.Post("/:deliveryId/claim", handler.ClaimDelivery)
		group.Post("/:deliveryId/pickup", handler.PickupOrder)
		group.Post("/:deliveryId/complete", handler.CompleteOrder)
	}

	{
		proto.RegisterDeliveryServiceServer(s.grpc, grpc.NewServer(s.app))
	}
	return nil
}
