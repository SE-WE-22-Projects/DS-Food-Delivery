package userservice

import (
	"context"
	"crypto/rsa"
	"net"
	"strconv"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/auth"
	"github.com/gofiber/fiber/v3"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.uber.org/zap"

	// force google.golang.org/genproto v0.0.0-20250303144028-a0af3efb3deb to stay in go.mod
	// See https://github.com/googleapis/go-genproto/issues/1015
	_ "google.golang.org/genproto/protobuf/ptype"

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
	OAuth    auth.OAuthConfig
	Database database.MongoConfig
	Logger   logger.Config
}

type Server struct {
	app  *fiber.App
	grpc *grpc.Server
	cfg  *Config
	db   *mongo.Client
	key  *rsa.PrivateKey
}

// New creates a new server.
func New(cfg *Config, db *mongo.Client, key *rsa.PrivateKey) *Server {
	s := &Server{cfg: cfg, db: db, key: key}

	s.app = fiber.New(shared.DefaultFiberConfig)

	s.app.Use(middleware.Recover())

	s.grpc = grpc.NewServer(grpc.ConnectionTimeout(time.Second * 10))

	return s
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	go s.startGrpcServer(ctx)

	address := net.JoinHostPort("", strconv.Itoa(s.cfg.Server.Port))

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

	address := net.JoinHostPort("", strconv.Itoa(s.cfg.GRPC.Port))

	lis, err := net.Listen("tcp", address)
	if err != nil {
		zap.L().Fatal("Failed to listen", zap.Error(err))
	}
	zap.L().Sugar().Infof("GRPC server listening at %v", lis.Addr())
	if err := s.grpc.Serve(lis); err != nil {
		zap.L().Fatal("Failed to start GRPC server", zap.Error(err))
	}
}
