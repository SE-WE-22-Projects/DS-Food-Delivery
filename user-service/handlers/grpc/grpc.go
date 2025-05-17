package grpc

import (
	"context"
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type Handler struct {
	db repo.UserRepo
	proto.UnimplementedUserServiceServer
}

func NewGRPC(db repo.UserRepo) *Handler { return &Handler{db: db} }

func (h *Handler) GetUserBy(ctx context.Context, req *proto.UserRequest) (*proto.UserDetails, error) {
	user, err := h.db.GetUserByID(ctx, req.UserId)
	if err != nil {
		if errors.Is(err, repo.ErrInvalidID) {
			return nil, status.Error(codes.InvalidArgument, err.Error())
		} else if errors.Is(err, repo.ErrNoUser) {
			return nil, status.Error(codes.NotFound, err.Error())
		}
		return nil, err
	}

	return &proto.UserDetails{
		UserId:       user.ID.Hex(),
		UserName:     user.Name,
		Address:      user.Address.Address(),
		Mobile:       user.MobileNo,
		ProfileImage: user.ProfileImage,
	}, nil

}
