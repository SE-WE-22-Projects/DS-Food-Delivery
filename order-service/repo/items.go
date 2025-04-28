package repo

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ItemRepo interface {
	GetItemsById(ctx context.Context, ids []string) ([]models.Item, error)
}

type stubItemRepo struct{}

// GetItemsById implements ItemRepo.
func (s *stubItemRepo) GetItemsById(ctx context.Context, ids []string) ([]models.Item, error) {
	items := make([]models.Item, len(ids))

	for i, id := range ids {
		_, err := bson.ObjectIDFromHex(id)
		if err != nil {
			items[i] = models.Item{
				ItemId:  id,
				Invalid: true,
			}
		} else {
			items[i] = models.Item{
				ItemId:      id,
				Name:        "Test Item",
				Description: "Item Description",
				Price:       200,
				Restaurant:  id[:12] + "000000000000",
			}
		}
	}

	return items, nil
}

func NewItemRepo() ItemRepo {
	return &stubItemRepo{}
}
