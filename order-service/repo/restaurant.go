package repo

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type RestaurantRepo interface {
	GetRestaurantById(ctx context.Context, id string) (*models.Restaurant, error)
}

type stubRestaurantRepo struct{}

// GetRestaurantById implements RestaurantRepo.
func (s *stubRestaurantRepo) GetRestaurantById(ctx context.Context, id string) (*models.Restaurant, error) {
	_, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	return &models.Restaurant{
		Id:       id,
		Name:     "Test Restaurant",
		Location: models.Point{},
	}, nil
}

func NewRestaurantRepo() RestaurantRepo {
	return &stubRestaurantRepo{}
}
