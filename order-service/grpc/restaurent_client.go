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
	client proto.RestaurentServiceClient
}

var _ repo.ItemRepo = (*RestaurantClient)(nil)

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
			// TODO: restaurant id

			// FIXME: change restaurant service to support this
			// Invalid: item.Invalid,
		}
	}

	return items, nil
}

func NewRestaurantClient(addr string) (*RestaurantClient, error) {
	con, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := proto.NewRestaurentServiceClient(con)

	return &RestaurantClient{client: client}, nil
}
