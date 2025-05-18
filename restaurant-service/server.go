package restaurantservice

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

//go:generate protoc --go_out=./proto --go_opt=paths=source_relative  --go-grpc_out=./proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/restaurant-service.proto

type Config struct {
	Server struct {
		Port int
	}
	GRPC struct {
		Port int
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
}

// New creates a new server.
func New(cfg *Config, db *mongo.Client) *Server {
	s := &Server{
		cfg:  cfg,
		db:   db,
		app:  fiber.New(shared.DefaultFiberConfig),
		grpc: grpc.NewServer(grpc.ConnectionTimeout(time.Second * 10)),
	}

	return s
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
	zap.L().Sugar().Infof("GRPC server listening at %v", lis.Addr())
	if err := s.grpc.Serve(lis); err != nil {
		zap.L().Fatal("Failed to start GRPC server", zap.Error(err))
	}
}
