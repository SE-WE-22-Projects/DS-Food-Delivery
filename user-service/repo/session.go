package repo

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type SessionRepo interface {
	GetUserSessions(ctx context.Context, userID string) ([]*models.Session, error)
	CreateSession(ctx context.Context, session *models.Session) (string, error)
	IsValidSession(ctx context.Context, userID string, sessionID string) (bool, error)
	UseSessionRefresh(ctx context.Context, userID string, sessionID string, refresh string) (bool, error)
	InvalidateSession(ctx context.Context, userID string, sessionID string) error
	InvalidateSessions(ctx context.Context, userID string) error
}

type sessionRepo struct {
	sessions *mongo.Collection
}

func NewSessionRepo(con *mongo.Database) SessionRepo {
	return &sessionRepo{sessions: con.Collection("session")}
}

// GetUserSessions implements SessionRepo.
func (u *sessionRepo) GetUserSessions(ctx context.Context, strUserID string) ([]*models.Session, error) {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return nil, ErrInvalidID
	}

	cursor, err := u.sessions.Find(ctx, bson.D{{Key: "user_id", Value: userID}})
	if err != nil {
		return nil, err
	}

	var sessions = []*models.Session{}
	if err = cursor.All(ctx, &sessions); err != nil {
		return nil, err
	}

	return sessions, nil
}

// CreateSession implements UserRepo.
func (u *sessionRepo) CreateSession(ctx context.Context, session *models.Session) (string, error) {
	session.CreatedAt = time.Now()
	if session.ExpiresAt.IsZero() || !session.ExpiresAt.After(session.CreatedAt) {
		return "", fmt.Errorf("invalid expires at")
	}
	session.CanRefresh = true

	result, err := u.sessions.InsertOne(ctx, session)
	if err != nil {
		return "", err
	}

	if objID, ok := result.InsertedID.(bson.ObjectID); ok {
		return objID.Hex(), nil
	}

	return "", fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)
}

// InvalidateSession implements UserRepo.
func (u *sessionRepo) InvalidateSession(ctx context.Context, strUserID string, strSessionID string) error {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return ErrInvalidID
	}

	sessionID, err := bson.ObjectIDFromHex(strSessionID)
	if err != nil {
		return ErrInvalidID
	}

	_, err = u.sessions.UpdateOne(ctx,
		bson.D{
			{Key: "_id", Value: sessionID},
			{Key: "user_id", Value: userID},
			{Key: "expires_at", Value: bson.D{bson.E{Key: "$gte", Value: time.Now()}}}},
		bson.D{{Key: "$set", Value: bson.D{
			{Key: "expires_at", Value: time.Now().Add(-time.Second)},
			{Key: "can_refresh", Value: false},
		}}})
	if err != nil {
		return err
	}

	return nil
}

// InvalidateSessions implements UserRepo.
func (u *sessionRepo) InvalidateSessions(ctx context.Context, strUserID string) error {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return ErrInvalidID
	}

	_, err = u.sessions.UpdateMany(ctx,
		bson.D{
			{Key: "user_id", Value: userID},
			{Key: "expires_at", Value: bson.D{bson.E{Key: "$gte", Value: time.Now()}}}},
		bson.D{{Key: "$set", Value: bson.D{
			{Key: "expires_at", Value: time.Now().Add(-time.Second)},
			{Key: "can_refresh", Value: false},
		}}})
	if err != nil {
		return err
	}

	return nil
}

// UseSessionRefresh implements UserRepo.
func (u *sessionRepo) UseSessionRefresh(ctx context.Context, strUserID string, strSessionID string, refresh string) (bool, error) {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return false, ErrInvalidID
	}

	sessionID, err := bson.ObjectIDFromHex(strSessionID)
	if err != nil {
		return false, ErrInvalidID
	}

	result, err := u.sessions.UpdateOne(ctx,
		bson.D{
			{Key: "_id", Value: sessionID},
			{Key: "user_id", Value: userID},
			{Key: "can_refresh", Value: true},
			{Key: "refresh", Value: refresh},
		},
		bson.D{{Key: "$set", Value: bson.D{
			{Key: "expires_at", Value: time.Now().Add(-time.Second)},
			{Key: "can_refresh", Value: false},
		},
		}})
	if err != nil {
		return false, err
	}

	return result.ModifiedCount > 0, nil
}

// IsValidSession implements UserRepo.
func (u *sessionRepo) IsValidSession(ctx context.Context, strUserID string, strSessionID string) (bool, error) {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return false, ErrInvalidID
	}

	sessionID, err := bson.ObjectIDFromHex(strSessionID)
	if err != nil {
		return false, ErrInvalidID
	}

	err = u.sessions.FindOne(ctx, bson.D{
		{Key: "_id", Value: sessionID},
		{Key: "user_id", Value: userID},
		{Key: "can_refresh", Value: true},
		{Key: "expires_at", Value: bson.D{bson.E{Key: "$gte", Value: time.Now()}}},
	}).Err()
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}
