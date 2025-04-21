package repo

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ItemRepo interface {
	GetItemsById(ids []string) ([]models.Item, error)
}

type stubItemRepo struct{}

// GetItemsById implements ItemRepo.
func (s *stubItemRepo) GetItemsById(ids []string) ([]models.Item, error) {
	items := make([]models.Item, len(ids))

	for i, id := range ids {
		_, err := bson.ObjectIDFromHex(id)
		if err != nil {
			return nil, err
		}

		items[i] = models.Item{
			ItemId:      id,
			Name:        "Test Item",
			Description: "Item Description",
			Price:       200,
		}
	}

	return items, nil
}

func NewItemRepo() ItemRepo {
	return &stubItemRepo{}
}
