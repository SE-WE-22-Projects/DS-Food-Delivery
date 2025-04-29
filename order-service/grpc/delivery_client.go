package grpc

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type DeliveryClient struct {
	client proto.DeliveryServiceClient
}

func NewDeliveryClient(addr string) (*DeliveryClient, error) {
	con, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := proto.NewDeliveryServiceClient(con)

	return &DeliveryClient{client: client}, nil
}
