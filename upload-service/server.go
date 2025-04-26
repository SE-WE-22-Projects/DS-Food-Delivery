package uploadservice

import (
	"context"
	"crypto/rsa"
	"fmt"
	"path/filepath"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

type Config struct {
	Server struct {
		Port int
	}
	Logger logger.Config
	Upload struct {
		Directory string
		Prefix    string
	}
}

type Server struct {
	app *fiber.App
	cfg *Config
	key *rsa.PublicKey
}

// New creates a new server.
func New(cfg *Config, key *rsa.PublicKey) *Server {
	s := &Server{cfg: cfg, key: key}

	s.app = fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler(zap.L()),
		JSONDecoder:  middleware.UnmarshalJsonStrict,
	})

	s.app.Use(middleware.Recover())

	return s
}

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	directory, err := filepath.Abs(s.cfg.Upload.Directory)
	if err != nil {
		return err
	}

	public := s.app.Group("/uploads/public")
	// only allow admins to upload public files
	public.Post("/", uploadFile(directory, s.cfg.Upload.Prefix, true), middleware.Auth(s.key), middleware.RequireRole("user_admin"))
	// allow anyone to access public files
	public.Get("/:directory/:fileId", sendFile(directory, true))

	// only allow users and admins to access user files
	private := s.app.Group("/uploads/user/:directory")
	private.Use(middleware.Auth(s.key))
	s.app.Use(middleware.RequireRoleFunc(func(c fiber.Ctx, tc middleware.TokenClaims) bool {
		userId := c.Params("directory")
		return tc.UserId == userId
	}), "user_admin")

	private.Post("/", uploadFile(directory, s.cfg.Upload.Prefix, false))
	private.Get("/:fileId", sendFile(directory, false))

	return nil
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	address := fmt.Sprintf(":%d", s.cfg.Server.Port)

	zap.S().Infof("HTTP server listening on %s", address)
	return s.app.Listen(address, fiber.ListenConfig{GracefulContext: ctx, DisableStartupMessage: true})
}
