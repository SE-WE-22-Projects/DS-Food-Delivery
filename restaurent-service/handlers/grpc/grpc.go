package grpc

import (
	"context"
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/repo"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type GrpcHandler struct {
	proto.UnimplementedRestaurentServiceServer
	restaurentRepo repo.RestaurentRepo
}

func (g *GrpcHandler) GetItemsById(ctx context.Context, idList *proto.ItemIdList) (*proto.ItemList, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetItemsById not implemented")
}

func (g *GrpcHandler) GetRestaurentById(ctx context.Context, restaurentId *proto.RestaurentId) (*proto.Restaurent, error) {
	result, err := g.restaurentRepo.GetRestaurentById(ctx, restaurentId.RestaurentId)

	if err != nil {
		if errors.Is(err, repo.ErrNoRes) {
			return nil, status.Errorf(codes.NotFound, "Restarent does not exist")
		} else if errors.Is(err, repo.ErrInvalidId) {
			return nil, status.Errorf(codes.InvalidArgument, "Invalid Restaurent ID")
		}
		return nil, status.Errorf(codes.Internal, "Internal error in GetRestaurentById")
	}

	return &proto.Restaurent{
		RestaurentId: result.Id.Hex(),
		Name: result.Name,
		OwnerId: result.Owner.Hex(),
	},nil
}

func New(restaurentRepo repo.RestaurentRepo) *GrpcHandler{
	return &GrpcHandler{
		restaurentRepo: restaurentRepo,
	}
}
