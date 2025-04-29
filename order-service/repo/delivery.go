package repo

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.uber.org/zap"
)

type DeliveryRepo interface {
	AddDelivery(ctx context.Context, order *models.Order) error
}

type stubDeliveryService struct{}

// AddDelivery implements DeliveryRepo.
func (s *stubDeliveryService) AddDelivery(ctx context.Context, order *models.Order) error {
	zap.S().Infof("Sending order to delivery service: %v", order)
	return nil
}

func NewDeliveryRepo() DeliveryRepo {
	return &stubDeliveryService{}
}
