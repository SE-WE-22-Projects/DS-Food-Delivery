package models

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID       bson.ObjectID `json:"id" bson:"_id,omitempty"`
	Name     string        `json:"name" bson:"name"`
	MobileNo string        `json:"mobile_no" bson:"mobile_no"`
	Email    string        `json:"email" bson:"email"`
	Address  Address       `json:"address" bson:"address_v2"`

	Password string `json:"-" bson:"password"`

	Roles []string `json:"roles" bson:"roles"`

	ProfileImage string `json:"profile_image" bson:"profile_image,omitempty"`

	EmailVerified bool `json:"email_verified" bson:"email_verified"`
	PhoneVerified bool `json:"phone_verified" bson:"phone_verified"`

	EmailVerify *Verification `json:"-" bson:"email_verify,omitempty"`
	PhoneVerify *Verification `json:"-" bson:"phone_verify,omitempty"`

	// PasswordExpired indicates that the user's password has expired and should be changed.
	PasswordExpired bool `json:"password_expired" bson:"password_expired"`

	// Driver profile for the user. This will be null if the user is not a driver.
	DriverProfile *Driver `json:"driver_profile" bson:"driver_profile"`

	CreatedAt time.Time  `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" bson:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty" bson:"deleted_at,omitempty"`
}

type Session struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectID `bson:"user_id" json:"user"`
	CreatedAt time.Time     `bson:"create_at" json:"created_at"`
	ExpiresAt time.Time     `bson:"expires_at" json:"expires_at"`

	Refresh    string `bson:"refresh" json:"-"`
	CanRefresh bool   `bson:"can_refresh" json:"-"`

	UA string `bson:"ua" json:"ua"`
	IP string `bson:"ip" json:"ip"`
}

type Verification struct {
	// Code is the verification code sent to the user
	Code string `bson:"code"`
	// Created stores when the verification code was created
	Created time.Time `bson:"created"`
	// Expires stores when the token expires
	Expires time.Time `bson:"expires"`
}

type Address struct {
	No         string `json:"no" bson:"no" validate:"min=1"`
	Street     string `json:"street" bson:"street" validate:"min=1"`
	Town       string `json:"town" bson:"town" validate:"min=1"`
	City       string `json:"city" bson:"city" validate:"min=1"`
	PostalCode string `json:"postal_code" bson:"postal_code" validate:"min=1"`
	Position   Point  `json:"position" bson:"location"`
}

type Point struct {
	Type string `json:"type" bson:"type"`
	// Coordinates contains the coordinates as [longitude, latitude]
	Coordinates [2]float64 `json:"coordinates" bson:"coordinates"`
}

func (a *Address) Address() string {
	return fmt.Sprintf("%s, %s, %s, %s, Sri Lanka %s", a.No, a.Street, a.Town, a.City, a.PostalCode)
}

type UserCreate struct {
	Name     string  `json:"name" validate:"required,min=4,max=40" bson:"name"`
	MobileNo string  `json:"mobile_no" validate:"required,e164" bson:"mobile_no"`
	Email    string  `json:"email" validate:"required,email" bson:"email"`
	Address  Address `json:"address" validate:"required" bson:"address_v2"`
	Password string  `json:"password" validate:"required,min=6,max=64"`
}

type UserUpdate struct {
	Name         string  `json:"name" validate:"omitempty,min=4,max=40" bson:"name,omitempty"`
	MobileNo     string  `json:"mobile_no" validate:"omitempty,e164" bson:"mobile_no,omitempty"`
	Email        string  `json:"email" validate:"omitempty,email" bson:"email,omitempty"`
	Address      Address `json:"address" validate:"omitempty" bson:"address_v2,omitempty"`
	ProfileImage string  `json:"profile_image" validate:"omitempty" bson:"profile_image,omitempty"`
	Password     string  `json:"password" validate:"omitempty,min=6,max=64" bson:"password,omitempty"`
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

func (u *User) MarshalBSON() ([]byte, error) {
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	u.UpdatedAt = time.Now()

	type my User
	return bson.Marshal((*my)(u))
}
