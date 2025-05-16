package uploadservice

import (
	"context"
	"fmt"
	"path/filepath"
	"sync"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/logger"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware/auth"
	"github.com/gofiber/fiber/v3"
	"github.com/spf13/afero"
	"go.uber.org/zap"
	"golang.org/x/sync/singleflight"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
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
	S3 struct {
		Use    bool
		Region string
		Secret string
		Key    string
		Bucket string
	}
}

type Server struct {
	app *fiber.App
	cfg *Config
	fs  afero.Fs

	s3           *s3.S3
	s3Downloader *s3manager.Downloader
	singleflight singleflight.Group
	notFound     sync.Map
}

// New creates a new server.
func New(cfg *Config) (*Server, error) {
	directory, err := filepath.Abs(cfg.Upload.Directory)
	if err != nil {
		return nil, err
	}

	s := &Server{
		app: fiber.New(shared.DefaultFiberConfig),
		fs:  afero.NewBasePathFs(afero.NewOsFs(), directory),
		cfg: cfg,
	}

	s.app.Use(middleware.Recover())

	if s.cfg.S3.Use {
		sess, err := session.NewSession(&aws.Config{
			Region:      aws.String(s.cfg.S3.Region),
			Credentials: credentials.NewStaticCredentials(s.cfg.S3.Key, s.cfg.S3.Secret, ""),
		})
		if err != nil {
			return nil, err
		}

		s.s3 = s3.New(sess)
		s.s3Downloader = s3manager.NewDownloader(sess)

		zap.L().Info("Using S3 storage")
	} else {
		zap.L().Info("S3 is disabled")
	}

	return s, nil
}

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {

	public := s.app.Group("/uploads/public")
	// only allow admins to upload public files
	public.Post("/", s.HandleUploadFile(true), auth.New(), middleware.RequireRole("user_admin"))
	// allow anyone to access public files
	public.Get("/:directory/:fileId", s.HandleGetFile(true))

	// only allow users and admins to access user files
	private := s.app.Group("/uploads/user/:directory")
	private.Use(auth.New())
	s.app.Use(middleware.RequireRoleFunc(func(c fiber.Ctx, tc middleware.TokenClaims) bool {
		userId := c.Params("directory")
		return tc.UserId == userId
	}), "user_admin")

	private.Post("/", s.HandleUploadFile(false))
	private.Get("/:fileId", s.HandleGetFile(false))

	return nil
}

// Start starts the server.
// This will block until ctx is cancelled.
func (s *Server) Start(ctx context.Context) error {
	address := fmt.Sprintf(":%d", s.cfg.Server.Port)

	if s.cfg.Logger.HideBanner {
		zap.S().Infof("HTTP server listening on %s", address)
	}

	return s.app.Listen(address, fiber.ListenConfig{GracefulContext: ctx, DisableStartupMessage: s.cfg.Logger.HideBanner})
}
