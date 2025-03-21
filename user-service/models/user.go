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
	Password string        `json:"-" bson:"password"`
	// TODO: location data
	ProfileImage string `json:"profile_image" bson:"profile_image,omitempty"`

	Verified        bool          `json:"verified" bson:"verified"`
	Verify          *Verification `json:"-" bson:"verify_code,omitempty"`
	PasswordExpired bool          `json:"password_expired" bson:"password_expired"`

	CreatedAt time.Time  `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" bson:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" bson:"deleted_at,omitempty"`
}

type Verification struct {
	// Code is the verification code sent to the user
	Code string `bson:"code"`
	// Created stores when the verification code was created
	Created time.Time `bson:"created"`
	// Expires stores when the token expires
	Expires time.Time `bson:"expires"`
	// Attempts is the number of remaining attempts for the verification
	Attempts int `bson:"attempts"`
}

type UserPassword struct {
	Password string `json:"password" validate:"required,min=6,max=64"`
}

type UserCreate struct {
	UserUpdate
	UserPassword
}

type UserUpdate struct {
	Name     string `json:"name" validate:"required,min=4,max=40"`
	MobileNo string `json:"mobile" validate:"required,e164"`
	Email    string `json:"email" validate:"required,email"`
	Address  string `json:"address" validate:"required,min=10,max=100"`
	// TODO: location data
}

func (c *UserCreate) ToUser() *User {
	user := &User{
		Name:     c.Name,
		MobileNo: c.MobileNo,
		Email:    c.Email,
		Address:  c.Address,
	}

	return user
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
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	u.UpdatedAt = time.Now()

	type my User
	return bson.Marshal((*my)(u))
}
