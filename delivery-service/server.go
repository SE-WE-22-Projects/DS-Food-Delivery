package orderservice

import (
	"context"
	"crypto/rsa"
	"fmt"
	"net"
	"runtime/debug"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

//go:generate protoc --go_out=./grpc/proto --go_opt=paths=source_relative  --go-grpc_out=./grpc/proto --go-grpc_opt=paths=source_relative --proto_path ../shared/api/ ../shared/api/delivery-service.proto

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
	cfg  *Config
	db   *mongo.Client
	key  *rsa.PublicKey
}

// New creates a new server.
func New(cfg *Config, db *mongo.Client, key *rsa.PublicKey) *Server {
	s := &Server{cfg: cfg, db: db, key: key}

	s.app = fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(zap.L()),
		JSONDecoder:  middleware.UnmarshalJsonStrict,
	})

	s.app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c fiber.Ctx, e any) {
			if cfg.Logger.Dev {
				zap.S().Errorf("Panic while handling request: %s\n %s", e, debug.Stack())
			} else {
				zap.L().Error("Panic while handling request", zap.Any("error", e), zap.Stack("stack"))
			}
		},
	}))

	s.grpc = grpc.NewServer(grpc.ConnectionTimeout(time.Second * 10))

	return s
}

// ConnectServices connects to the other microservices
func (s *Server) ConnectServices() {
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
