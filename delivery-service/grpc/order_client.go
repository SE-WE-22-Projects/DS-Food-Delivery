package grpc

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/grpc/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type OrderClient struct {
	client proto.OrderServiceClient
}

func (o *OrderClient) SetOrderDelivered(ctx context.Context, orderId string) error {
	_, err := o.client.SetDeliveryStatus(ctx, &proto.DeliveryProgress{
		OrderId: orderId,
		Status:  proto.DeliveryStatus_Delivered,
	})

	return err
}

func (o *OrderClient) SetOrderPickUp(ctx context.Context, orderId string) error {
	_, err := o.client.SetDeliveryStatus(ctx, &proto.DeliveryProgress{
		OrderId: orderId,
		Status:  proto.DeliveryStatus_Delivering,
	})

	return err
}

func (o *OrderClient) SetDeliveryDriver(ctx context.Context, orderId string, driverId string) error {
	_, err := o.client.SetDeliveryDriver(ctx, &proto.OrderDriver{
		OrderId:  orderId,
		DriverId: driverId,
	})
	return err
}

func NewOrderClient(addr string) (*OrderClient, error) {
	con, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := proto.NewOrderServiceClient(con)

	return &OrderClient{client}, nil
}
