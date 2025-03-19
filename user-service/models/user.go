package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID       bson.ObjectID `json:"id" bson:"_id,omitempty"`
	Name     string        `json:"name" bson:"name"`
	MobileNo string        `json:"mobile_no" bson:"mobile_no"`
	Email    string        `json:"email" bson:"email"`
	Address  string        `json:"address" bson:"address"`
	// TODO: location data
	ProfileImage string `json:"profile_image" bson:"profile_image,omitempty"`

	timestamp
}

// IsDeleted returns if this user has been deleted.
// A user is deleted if the DeletedAt timestamp is set.
func (u *User) IsDeleted() bool {
	return u.DeletedAt != nil && !u.DeletedAt.IsZero()
}

// MarkDeleted marks the user as deleted
func (u *User) MarkDeleted() {
	now := time.Now()

	u.DeletedAt = &now
}

func (u *User) MarshalBSON() ([]byte, error) {
	u.timestamp.updateTimestamps()

	type my User
	return bson.Marshal((*my)(u))
}
