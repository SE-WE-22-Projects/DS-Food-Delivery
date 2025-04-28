package orderservice

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net"
	"time"

	services "github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/location"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/order-service.proto

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/restaurant-service.proto

type Config struct {
	Server struct {
		Port int
	}
	GRPC struct {
		Port int
	}

	Services struct {
		Restaurant string
		Promotion  string
	}

	Google struct {
		Key string
	}

	Database database.MongoConfig
	Logger   logger.Config
}

type Server struct {
	app  *fiber.App
	grpc *grpc.Server
	cfg  *Config
	db   *mongo.Client
	key  *rsa.PublicKey

	services struct {
		items      repo.ItemRepo
		restaurant repo.RestaurantRepo
		promotions repo.PromotionRepo
		location   *location.LocationService
	}
}

// New creates a new server.
func New(cfg *Config, db *mongo.Client, key *rsa.PublicKey) *Server {
	s := &Server{cfg: cfg, db: db, key: key}

	s.app = fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(zap.L()),
		JSONDecoder:  middleware.UnmarshalJsonStrict,
	})

	s.app.Use(middleware.Recover())

	s.grpc = grpc.NewServer(grpc.ConnectionTimeout(time.Second * 10))

	return s
}

// ConnectServices connects to the other microservices
func (s *Server) ConnectServices() {
	var err error

	if len(s.cfg.Services.Restaurant) != 0 {
		restaurantClient, err := services.NewRestaurantClient(s.cfg.Services.Restaurant)
		if err != nil {
			zap.L().Fatal("Failed to connect to restaurant service", zap.Error(err))
		}

		zap.S().Infof("Connected to restaurant service at %s", s.cfg.Services.Restaurant)
		s.services.restaurant = restaurantClient
		s.services.items = restaurantClient
	} else {
		s.services.items = repo.NewItemRepo()
		s.services.restaurant = repo.NewRestaurantRepo()
		zap.S().Infof("Using stub service for restaurant service")
	}

	if len(s.cfg.Services.Promotion) != 0 {
		zap.S().Panic("Promotion service client not implemented")
	} else {
		s.services.promotions = repo.NewPromoRepo()
		zap.S().Infof("Using stub service for promotion service")
	}

	s.services.location, err = location.New(s.cfg.Google.Key)
	if err != nil {
		zap.L().Fatal("Failed to create location service", zap.Error(err))
	}
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	go s.startGrpcServer(ctx)

	address := fmt.Sprintf(":%d", s.cfg.Server.Port)
	return s.app.Listen(address, fiber.ListenConfig{GracefulContext: ctx, DisableStartupMessage: !s.cfg.Logger.Dev})
}

func (s *Server) startGrpcServer(ctx context.Context) {

	go func() {
		<-ctx.Done()
		s.grpc.Stop()
		zap.L().Info("Shutting down grpc server")
	}()

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", s.cfg.GRPC.Port))
	if err != nil {
		zap.L().Fatal("Failed to listen", zap.Error(err))
	}
	zap.S().Infof("GRPC server listening at %v", lis.Addr())
	if err := s.grpc.Serve(lis); err != nil {
		zap.L().Fatal("Failed to start GRPC server", zap.Error(err))
	}
}
