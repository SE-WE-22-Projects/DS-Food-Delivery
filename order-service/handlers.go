package orderservice

import (
	grpc "github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/handlers"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	db := s.db.Database("order-service")

	cart, err := repo.NewCartRepo(db, s.services.restaurant, s.services.promotions)
	if err != nil {
		s.log.Fatal("Failed to create cart repo", zap.Error(err))
	}

	order, err := repo.NewOrderRepo(db, cart)
	if err != nil {
		s.log.Fatal("Failed to create order repo", zap.Error(err))
	}

	s.app.Use(middleware.Auth(s.key))

	{
		handler := handlers.NewCart(s.log, cart)
		group := s.app.Group("/cart/:userId")

		group.Use(middleware.RequireRoleFunc("user_admin", func(c fiber.Ctx, tc middleware.TokenClaims) bool {
			return c.Params("userId") == tc.UserId
		}))

		group.Get("/", handler.GetCart)
		group.Delete("/", handler.ClearCart)

		group.Post("/items", handler.AddToCart)
		group.Put("/items/:cartItemId", handler.UpdateCartItem)
		group.Delete("/items/:cartItemId", handler.RemoveFromCart)

		group.Post("/coupon", handler.ApplyCoupon)
		group.Delete("/coupon", handler.RemoveCoupon)
	}

	{
		handler := handlers.NewOrder(s.log, order)
		group := s.app.Group("/orders")

		group.Get("/:orderId", handler.GetOrder)
		group.Delete("/:orderId", handler.CancelOrder)
		group.Post("/from-cart/:userId", handler.CreateOrder)
	}

	{
		proto.RegisterOrderServiceServer(s.grpc, grpc.NewServer(s.log, order))
	}

	return nil
}
