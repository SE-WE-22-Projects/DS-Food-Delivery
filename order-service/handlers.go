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

func userPermissionCheck(c fiber.Ctx, tc middleware.TokenClaims) bool {
	return c.Params("userId") == tc.UserId
}

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	db := s.db.Database("order-service")

	cart, err := repo.NewCartRepo(db, s.services.items, s.services.promotions)
	if err != nil {
		zap.L().Fatal("Failed to create cart repo", zap.Error(err))
	}

	order, err := repo.NewOrderRepo(db, cart, s.services.restaurant, s.services.delivery)
	if err != nil {
		zap.L().Fatal("Failed to create order repo", zap.Error(err))
	}

	s.app.Use(middleware.Auth(s.key))

	{
		handler := handlers.NewCart(zap.L(), cart)
		group := s.app.Group("/cart/:userId")

		group.Use(middleware.RequireRoleFunc(userPermissionCheck, "user_admin"))

		group.Get("/", handler.GetCart)
		group.Delete("/", handler.ClearCart)

		group.Post("/items", handler.AddToCart)
		group.Put("/items/:cartItemId", handler.UpdateCartItem)
		group.Delete("/items/:cartItemId", handler.RemoveFromCart)

		group.Post("/coupon", handler.ApplyCoupon)
		group.Delete("/coupon", handler.RemoveCoupon)
	}

	{
		handler := handlers.NewOrder(zap.L(), order, &s.services.notification)
		group := s.app.Group("/orders")

		group.Get("/", handler.GetByAll)
		group.Get("/by-restaurant/:restaurantId", handler.GetByRestaurant)
		group.Get("/by-user/:userId", handler.GetByUser)

		group.Get("/:orderId", handler.GetOrder)
		group.Post("/:orderId/restaurant-status", handler.SetRestaurantOrderStatus)
		group.Delete("/:orderId", handler.CancelOrder)
		group.Post("/from-cart/:userId", handler.CreateOrder, middleware.RequireRoleFunc(userPermissionCheck, "user_admin"))
	}

	{
		proto.RegisterOrderServiceServer(s.grpc, grpc.NewServer(order))
	}

	return nil
}
