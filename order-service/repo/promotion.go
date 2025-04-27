package repo

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type PromotionRepo interface {
	GetPromoById(id string) (*models.Coupon, error)
}

type stubPromoRepo struct{}

func (s *stubPromoRepo) GetPromoById(id string) (*models.Coupon, error) {
	_, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	return &models.Coupon{
		CouponId:    id,
		Name:        "Test promo",
		Description: "Test promotion",
		Discount:    10.00,
	}, nil
}

func NewPromoRepo() PromotionRepo {
	return &stubPromoRepo{}
}
