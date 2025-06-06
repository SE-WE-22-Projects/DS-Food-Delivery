package orderservice

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net"
	"time"

	services "github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/grpc/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/notify"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/order-service.proto

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/restaurant-service.proto

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/delivery-service.proto

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/user-service.proto

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
		Delivery   string
		User       string
	}

	Notify notify.Config

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
		items        repo.ItemRepo
		restaurant   repo.RestaurantRepo
		promotions   repo.PromotionRepo
		delivery     repo.DeliveryRepo
		notification notify.Notify
		user         proto.UserServiceClient
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

	if len(s.cfg.Services.Delivery) != 0 {
		s.services.delivery, err = services.NewDeliveryClient(s.cfg.Services.Delivery)
		if err != nil {
			zap.L().Fatal("Failed to connect to delivery service", zap.Error(err))
		}

		zap.S().Infof("Connected to delivery service at %s", s.cfg.Services.Delivery)
	} else {
		s.services.delivery = repo.NewDeliveryRepo()
		zap.S().Infof("Using stub service for delivery service")
	}

	err = s.services.notification.Connect(context.TODO(), s.cfg.Notify)
	if err != nil {
		zap.L().Fatal("Failed to connect to notification service", zap.Error(err))
	}

	con, err := grpc.NewClient(s.cfg.Services.User, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		zap.L().Fatal("Failed to connect to user service", zap.Error(err))
	}

	s.services.user = proto.NewUserServiceClient(con)
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	go s.startGrpcServer(ctx)

	address := fmt.Sprintf(":%d", s.cfg.Server.Port)

	if s.cfg.Logger.HideBanner {
		zap.S().Infof("HTTP server listening on %s", address)
	}
	return s.app.Listen(address, fiber.ListenConfig{GracefulContext: ctx, DisableStartupMessage: s.cfg.Logger.HideBanner})
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
