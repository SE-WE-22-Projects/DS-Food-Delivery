package middleware

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

type RestaurentAuth struct {
	restaurentRepo repo.RestaurentRepo
	menuItemRepo repo.MenuItemRepo
	logger *zap.Logger
}

func (r *RestaurentAuth) RestaurentPermissionFunc(c fiber.Ctx, token middleware.TokenClaims) bool {
	result, err := r.restaurentRepo.GetRestaurentById(c.RequestCtx(),c.Params("restaurentId"))

	if err != nil {
		r.logger.Error("Failed to get restaurent ", zap.Error(err))
		return false
	}

	return result.Owner.Hex() == token.UserId
}

func (r *RestaurentAuth) MenuPermissionFunc(c fiber.Ctx, token middleware.TokenClaims) bool {
	menuItem,err := r.menuItemRepo.GetMenuItemById(c.RequestCtx(),c.Params("menuItemId"))
	if err != nil {
		r.logger.Error("Failed to get menu item ", zap.Error(err))
		return false
	}

	restaurent, err := r.restaurentRepo.GetRestaurentById(c.RequestCtx(), menuItem.RestaurentId.Hex())
	if err != nil {
		r.logger.Error("Failed to get restaurent ", zap.Error(err))
		return false
	}

	return restaurent.Owner.Hex() == token.UserId
}
