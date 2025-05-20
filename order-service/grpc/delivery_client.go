package grpc

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type DeliveryClient struct {
	client proto.DeliveryServiceClient
}

var _ (repo.DeliveryRepo) = (*DeliveryClient)(nil)

// AddDelivery implements repo.DeliveryRepo.
func (d *DeliveryClient) AddDelivery(ctx context.Context, order *models.Order) (string, error) {
	result, err := d.client.AddDelivery(ctx, &proto.DeliveryDetails{
		OrderId: order.OrderId.Hex(),
		UserId:  order.UserId,
		Destination: &proto.DeliveryAddress{
			No:         order.Destination.No,
			Street:     order.Destination.Street,
			Town:       order.Destination.Town,
			City:       order.Destination.City,
			PostalCode: order.Destination.PostalCode,
			Position: &proto.DeliveryLocation{
				Longitude: order.Destination.Position.Coordinates[0],
				Latitude:  order.Destination.Position.Coordinates[1],
			},
		},
		Pickup: &proto.DeliveryRestaurant{
			RestaurantId: order.Restaurant.Id,
			Name:         order.Restaurant.Name,
			OwnerId:      order.Restaurant.Id,
			Location: &proto.DeliveryLocation{
				Longitude: order.Restaurant.Location.Coordinates[0],
				Latitude:  order.Restaurant.Location.Coordinates[1],
			},
		},
	})
	if err != nil {
		return "", err
	}

	return result.DeliverId, nil
}

func NewDeliveryClient(addr string) (*DeliveryClient, error) {
	con, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := proto.NewDeliveryServiceClient(con)

	return &DeliveryClient{client: client}, nil
}
