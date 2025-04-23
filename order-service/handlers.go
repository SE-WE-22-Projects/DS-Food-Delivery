package orderservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/handlers"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"go.uber.org/zap"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	db := s.db.Database("order-service")

	cart, err := repo.NewCartRepo(db, repo.NewItemRepo(), repo.NewPromoRepo())
	if err != nil {
		s.log.Fatal("Failed to create cart repo", zap.Error(err))
	}

	{
		handler := handlers.NewCart(s.log, cart)
		group := s.app.Group("/cart/")

		group.Get("/:userId", handler.GetCart)
		group.Delete("/:userId", handler.ClearCart)

		group.Post("/:userId/items", handler.AddToCart)
		group.Put("/:userId/items/:cartItemId", handler.UpdateCartItem)
		group.Delete("/:userId/items/:cartItemId", handler.RemoveFromCart)

		group.Post("/:userId/coupon", handler.ApplyCoupon)
		group.Delete("/:userId/coupon", handler.RemoveCoupon)
	}

	return nil
}
