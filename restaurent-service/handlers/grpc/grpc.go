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
	menuItemRepo   repo.MenuItemRepo
}

func (g *GrpcHandler) GetItemsById(ctx context.Context, idList *proto.ItemIdList) (*proto.ItemList, error) {
	items := make([]*proto.Item, len(idList.ItemId))
	for i, itemId := range idList.ItemId {
		item, err := g.menuItemRepo.GetMenuItemById(ctx, itemId)

		if err != nil {
			if errors.Is(err, repo.ErrNoMenu) || errors.Is(err, repo.ErrInvalidId) {
				// mark item id as invalid
				items[i] = &proto.Item{Invalid: true}
				continue
			}
			return nil, status.Errorf(codes.Internal, "Internal error in GetMenuItemById")
		}

		items[i] = &proto.Item{
			ItemId:       item.Id.Hex(),
			RestaurentId: item.RestaurentId.Hex(),
			Name:         item.Name,
			Description:  item.Description,
			Price:        item.Price,
		}
	}

	return &proto.ItemList{Item: items}, nil
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
		Name:         result.Name,
		OwnerId:      result.Owner.Hex(),
	}, nil
}

func New(restaurentRepo repo.RestaurentRepo, menuItemRepo repo.MenuItemRepo) *GrpcHandler {
	return &GrpcHandler{
		restaurentRepo: restaurentRepo,
		menuItemRepo:   menuItemRepo,
	}
}
