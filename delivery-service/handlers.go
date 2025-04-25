package orderservice

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
)

// RegisterRoutes registers all routes in the server
func (s *Server) RegisterRoutes() error {
	s.app.Use(middleware.Auth(s.key))

	return nil
}
