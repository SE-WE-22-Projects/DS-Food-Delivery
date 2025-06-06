package grpc

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type RestaurantClient struct {
	client proto.RestaurantServiceClient
}

var _ repo.ItemRepo = (*RestaurantClient)(nil)
var _ repo.RestaurantRepo = (*RestaurantClient)(nil)

// GetItemsById implements repo.ItemRepo.
func (r *RestaurantClient) GetItemsById(ctx context.Context, ids []string) ([]models.Item, error) {
	res, err := r.client.GetItemsById(ctx, &proto.ItemIdList{ItemId: ids})

	if err != nil {
		return nil, err
	}

	items := make([]models.Item, len(res.Item))

	for i, item := range res.Item {
		items[i] = models.Item{
			ItemId:      item.ItemId,
			Name:        item.Name,
			Description: item.Description,
			Price:       item.Price,
			Restaurant:  item.RestaurantId,
			Invalid:     item.Invalid,
		}
	}

	return items, nil
}

// GetRestaurantById implements repo.RestaurantRepo.
func (r *RestaurantClient) GetRestaurantById(ctx context.Context, id string) (*models.Restaurant, error) {
	res, err := r.client.GetRestaurantById(ctx, &proto.RestaurantId{RestaurantId: id})

	if err != nil {
		return nil, err
	}

	return &models.Restaurant{
		Id:   res.RestaurantId,
		Name: res.Name,
		Location: models.Point{
			Type:        "point",
			Coordinates: [2]float64{res.Location.Latitude, res.Location.Longitude},
		},
	}, nil
}

func NewRestaurantClient(addr string) (*RestaurantClient, error) {
	con, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := proto.NewRestaurantServiceClient(con)

	return &RestaurantClient{client: client}, nil
}
