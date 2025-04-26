package userservice

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

//go:generate protoc --go_out=./proto --go_opt=paths=source_relative  --go-grpc_out=./proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/user-service.proto

type Config struct {
	Server struct {
		Port int
	}
	GRPC struct {
		Port int
	}
	Database database.MongoConfig
	Logger   logger.Config
}

type Server struct {
	app  *fiber.App
	grpc *grpc.Server
	log  *zap.Logger
	cfg  *Config
	db   *mongo.Client
	key  *rsa.PrivateKey
}

// New creates a new server.
func New(cfg *Config, log *zap.Logger, db *mongo.Client, key *rsa.PrivateKey) *Server {
	s := &Server{cfg: cfg, db: db, log: log, key: key}

	s.app = fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(log),
		JSONDecoder:  middleware.UnmarshalJsonStrict,
	})

	s.app.Use(middleware.Recover())

	s.grpc = grpc.NewServer(grpc.ConnectionTimeout(time.Second * 10))

	return s
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
	zap.L().Sugar().Infof("GRPC server listening at %v", lis.Addr())
	if err := s.grpc.Serve(lis); err != nil {
		zap.L().Fatal("Failed to start GRPC server", zap.Error(err))
	}
}
