package orderservice

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/delivery-service/app"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/delivery-service.proto

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/user-service.proto

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/order-service.proto

type Config struct {
	Server struct {
		Port int
	}
	GRPC struct {
		Port int
	}

	Database database.MongoConfig
	Logger   logger.Config
	Services app.ServiceConfig
}

type Server struct {
	fiber *fiber.App
	grpc  *grpc.Server
	cfg   *Config
	app   *app.App
}

// New creates a new server.
func New(cfg *Config, db *mongo.Client) (*Server, error) {
	s := &Server{
		cfg:   cfg,
		fiber: fiber.New(shared.DefaultFiberConfig),
		grpc:  grpc.NewServer(grpc.ConnectionTimeout(time.Second * 10)),
	}
	shared.WithDefaultMiddleware(s.fiber)

	var err error
	s.app, err = app.New(s.cfg.Services, db)
	if err != nil {
		return nil, err
	}

	return s, nil
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	go s.startGrpcServer(ctx)

	address := fmt.Sprintf(":%d", s.cfg.Server.Port)
	if s.cfg.Logger.HideBanner {
		zap.S().Infof("HTTP server listening on %s", address)
	}
	return s.fiber.Listen(address, fiber.ListenConfig{GracefulContext: ctx, DisableStartupMessage: s.cfg.Logger.HideBanner})
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
