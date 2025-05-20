package grpc

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/models"
)

type OrderClient struct {
	proto.OrderServiceClient
}

func (o *OrderClient) UpdateOrderStatus(ctx context.Context, orderId string, status models.DeliveryState) error {
	var newStatus proto.DeliveryStatus
	switch status {
	case models.DeliveryStateDelivering:
		newStatus = proto.DeliveryStatus_Delivering
	case models.DeliveryStateUnclaimed, models.DeliveryStateWaiting:
		newStatus = proto.DeliveryStatus_Pending
	case models.DeliveryStateDone:
		newStatus = proto.DeliveryStatus_Delivered
	}

	_, err := o.SetDeliveryStatus(ctx, &proto.DeliveryProgress{
		OrderId: orderId,
		Status:  newStatus,
	})

	return err
}
