package grpc

import (
	"context"
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/repo"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type deliveryServiceServer struct {
	proto.UnimplementedDeliveryServiceServer
	delivery repo.DeliveryRepo
}

func (d *deliveryServiceServer) AddDelivery(ctx context.Context, details *proto.DeliveryDetails) (*proto.DeliverId, error) {
	deliveryId, err := d.delivery.AddDelivery(ctx, &models.Delivery{
		OrderId: details.OrderId,
		UserId:  details.UserId,
		Pickup: models.Restaurant{
			Id:   details.Pickup.RestaurantId,
			Name: details.Pickup.Name,
			Location: models.Point{
				Type:        "point",
				Coordinates: [2]float64{details.Pickup.Location.Longitude, details.Pickup.Location.Latitude},
			},
		},
		Destination: models.Address{
			No:         details.Destination.No,
			Street:     details.Destination.Street,
			Town:       details.Destination.Town,
			City:       details.Destination.City,
			PostalCode: details.Destination.PostalCode,
			Position: models.Point{
				Type:        "point",
				Coordinates: [2]float64{details.Destination.Position.Longitude, details.Destination.Position.Latitude},
			},
		},
	})

	zap.L().Info("Received new delivery", zap.String("orderId", details.OrderId))

	return &proto.DeliverId{DeliverId: deliveryId}, err
}

func (d *deliveryServiceServer) GetDeliveryByOrderId(ctx context.Context, details *proto.DeliveryOrderId) (*proto.Delivery, error) {
	delivery, err := d.delivery.GetByOrderId(ctx, details.OrderId)
	if err != nil {
		if errors.Is(err, repo.ErrNoDelivery) {
			return nil, status.Errorf(codes.NotFound, "Delivery not found")
		}
		zap.L().Error("Internal Error", zap.String("orderId", details.OrderId))
		return nil, status.Errorf(codes.Internal, "Internal error in delivery service")
	}

	return &proto.Delivery{DeliveryId: delivery.Id.Hex(), DiverId: *delivery.DriverId, UserId: delivery.UserId}, nil
}

func NewServer(db repo.DeliveryRepo) proto.DeliveryServiceServer {
	return &deliveryServiceServer{
		delivery: db,
	}
}
