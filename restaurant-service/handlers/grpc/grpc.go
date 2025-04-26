package grpc

import (
	"context"
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/repo"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type GrpcHandler struct {
	proto.UnimplementedRestaurantServiceServer
	restaurantRepo repo.RestaurantRepo
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
			RestaurantId: item.RestaurantId.Hex(),
			Name:         item.Name,
			Description:  item.Description,
			Price:        item.Price,
		}
	}

	return &proto.ItemList{Item: items}, nil
}

func (g *GrpcHandler) GetRestaurantById(ctx context.Context, restaurantId *proto.RestaurantId) (*proto.Restaurant, error) {
	result, err := g.restaurantRepo.GetRestaurantById(ctx, restaurantId.RestaurantId)

	if err != nil {
		if errors.Is(err, repo.ErrNoRes) {
			return nil, status.Errorf(codes.NotFound, "Restaurant does not exist")
		} else if errors.Is(err, repo.ErrInvalidId) {
			return nil, status.Errorf(codes.InvalidArgument, "Invalid Restaurant ID")
		}
		return nil, status.Errorf(codes.Internal, "Internal error in GetRestaurantById")
	}

	return &proto.Restaurant{
		RestaurantId: result.Id.Hex(),
		Name:         result.Name,
		OwnerId:      result.Owner.Hex(),
	}, nil
}

func New(restaurantRepo repo.RestaurantRepo, menuItemRepo repo.MenuItemRepo) *GrpcHandler {
	return &GrpcHandler{
		restaurantRepo: restaurantRepo,
		menuItemRepo:   menuItemRepo,
	}
}
