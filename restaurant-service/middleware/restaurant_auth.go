package middleware

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

type RestaurantAuth struct {
	restaurantRepo repo.RestaurantRepo
	menuItemRepo   repo.MenuItemRepo
	logger         *zap.Logger
}

func (r *RestaurantAuth) RestaurantPermissionFunc(c fiber.Ctx, token middleware.TokenClaims) bool {
	result, err := r.restaurantRepo.GetRestaurantById(c.RequestCtx(), c.Params("restaurantId"))

	if err != nil {
		r.logger.Error("Failed to get restaurant ", zap.Error(err))
		return false
	}

	return result.Owner.Hex() == token.UserId
}

func (r *RestaurantAuth) MenuPermissionFunc(c fiber.Ctx, token middleware.TokenClaims) bool {
	menuItem, err := r.menuItemRepo.GetMenuItemById(c.RequestCtx(), c.Params("menuItemId"))
	if err != nil {
		r.logger.Error("Failed to get menu item ", zap.Error(err))
		return false
	}

	restaurant, err := r.restaurantRepo.GetRestaurantById(c.RequestCtx(), menuItem.RestaurantId.Hex())
	if err != nil {
		r.logger.Error("Failed to get restaurant ", zap.Error(err))
		return false
	}

	return restaurant.Owner.Hex() == token.UserId
}
