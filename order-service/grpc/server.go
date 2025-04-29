package grpc

import (
	context "context"
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.uber.org/zap"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
)

type orderServiceServer struct {
	proto.UnimplementedOrderServiceServer
	orders repo.OrderRepo
	log    *zap.Logger
}

// GetOrderPrice gets the price for the order
func (o *orderServiceServer) GetOrderPrice(ctx context.Context, req *proto.OrderId) (*proto.OrderPrice, error) {
	orderId, err := bson.ObjectIDFromHex(req.OrderId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid order id")
	}

	order, err := o.orders.GetOrderById(ctx, orderId)
	if err != nil {
		if errors.Is(err, repo.ErrNoOrder) {
			return nil, status.Errorf(codes.NotFound, "Order not found")
		}
		o.log.Error("Failed to get order", zap.Error(err))
		return nil, status.Errorf(codes.Internal, "Failed to get order")
	}

	return &proto.OrderPrice{Price: order.Total}, nil

}

// SetPaymentStatus sets the result of the payment.
// This can be used on orders that are currently in the PendingPayment state.
func (o *orderServiceServer) SetPaymentStatus(ctx context.Context, req *proto.PaymentStatus) (*emptypb.Empty, error) {
	orderId, err := bson.ObjectIDFromHex(req.OrderId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid order id")
	}

	err = o.orders.UpdatePaymentStatus(ctx, orderId, req.Success, req.TransactionId)
	if err != nil {
		return o.handleErr("PendingPayment", err)
	}

	return &emptypb.Empty{}, nil
}

// SetRestaurantStatus sets if the order was accepted by the restaurant.
// This can be used on orders that are currently in the PendingAccept state.
func (o *orderServiceServer) SetRestaurantStatus(ctx context.Context, req *proto.RestaurantStatus) (*emptypb.Empty, error) {
	orderId, err := bson.ObjectIDFromHex(req.OrderId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid order id")
	}

	err = o.orders.UpdateAcceptedStatus(ctx, orderId, req.Accepted, req.RejectReason)
	if err != nil {
		return o.handleErr("PendingAccept", err)
	}

	return &emptypb.Empty{}, nil
}

// SetDeliveryDriver sets the delivery driver for an order.
// This can be used on orders that are currently in the AwaitingPickup state.
func (o *orderServiceServer) SetDeliveryDriver(ctx context.Context, req *proto.OrderDriver) (*emptypb.Empty, error) {
	orderId, err := bson.ObjectIDFromHex(req.OrderId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid order id")
	}

	err = o.orders.SetDeliveryDriver(ctx, orderId, req.DriverId)
	if err != nil {
		return o.handleErr("AwaitingPickup", err)
	}

	return &emptypb.Empty{}, nil
}

// SetDeliveryStatus sets the delivery status for an order.
// This can be used on orders that are currently in the Delivering state.
func (o *orderServiceServer) SetDeliveryStatus(ctx context.Context, req *proto.DeliveryProgress) (*emptypb.Empty, error) {
	orderId, err := bson.ObjectIDFromHex(req.OrderId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "Invalid order id")
	}

	// ignore the status if the delivery is not complete
	if req.Status != proto.DeliveryStatus_Delivered {
		return &emptypb.Empty{}, nil
	}

	err = o.orders.SetOrderDelivered(ctx, orderId)
	if err != nil {
		return o.handleErr("Delivering", err)
	}

	return &emptypb.Empty{}, nil
}

// handleErr handles returning the grpc error for the given error
func (o *orderServiceServer) handleErr(expectedState string, err error) (*emptypb.Empty, error) {
	if errors.Is(err, repo.ErrNoOrder) {
		return nil, status.Errorf(codes.NotFound, "Order not found")
	} else if errors.Is(err, repo.ErrStateChange) {
		return nil, status.Errorf(codes.FailedPrecondition, "Order state is not %s", expectedState)
	}

	o.log.Error("Failed to set order status", zap.Error(err))
	return nil, status.Errorf(codes.Internal, "Failed to set order status")
}

func NewServer(log *zap.Logger, db repo.OrderRepo) proto.OrderServiceServer {
	return &orderServiceServer{
		orders: db,
		log:    log,
	}
}
