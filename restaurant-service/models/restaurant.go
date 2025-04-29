package models

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type OperatingTime struct {
	Open  time.Duration `json:"open" bson:"open"`
	Close time.Duration `json:"close" bson:"close"`
}

type Restaurant struct {
	Id             bson.ObjectID `json:"id" bson:"_id,omitempty"`
	Name           string        `json:"name" bson:"name"`
	RegistrationNo string        `json:"registration_no" bson:"registration_no"`
	Address        Address       `json:"address" bson:"address"`
	Owner          bson.ObjectID `json:"owner" bson:"owner"`
	Logo           string        `json:"logo" bson:"logo"`
	Cover          string        `json:"cover" bson:"cover"`
	Description    string        `json:"description" bson:"description"`
	Tags           []string      `json:"tags" bson:"tags"`
	OperatingTime  OperatingTime `json:"operation_time" bson:"operation_time"`
	Approved       bool          `json:"approved" bson:"approved"`
	CreatedAt      time.Time     `json:"created_at" bson:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at" bson:"updated_at"`
	DeletedAt      *time.Time    `json:"deleted_at,omitempty" bson:"deleted_at,omitempty"`
}

type RestaurantUpdate struct {
	Name          string          `json:"name" validate:"omitempty,min=2,max=100" bson:"name,omitempty"`
	Address       *RequestAddress `json:"address" validate:"omitempty" bson:"address,omitempty"`
	Description   string          `json:"description" validate:"omitempty,max=500" bson:"description,omitempty"`
	Tags          []string        `json:"tags" validate:"omitempty,dive,min=1,max=20" bson:"tags,omitempty"`
	Logo          string          `json:"logo" validate:"omitempty,filepath" bson:"logo,omitempty"`
	Cover         string          `json:"cover" validate:"omitempty,filepath" bson:"cover,omitempty"`
	OperatingTime *OperatingTime  `json:"operation_time" bson:"operation_time,omitempty"`
}

type RestaurantCreate struct {
	Name           string         `json:"name" validate:"min=2,max=100" bson:"name"`
	Address        RequestAddress `json:"address" bson:"address"`
	Description    string         `json:"description" validate:"max=500" bson:"description"`
	Tags           []string       `json:"tags" validate:"dive,min=1,max=20" bson:"tags"`
	Logo           string         `json:"logo" validate:"filepath" bson:"logo"`
	Cover          string         `json:"cover" validate:"filepath" bson:"cover"`
	OperatingTime  OperatingTime  `json:"operation_time" bson:"operation_time"`
	RegistrationNo string         `json:"registration_no" validate:"required"`
	OwnerID        string         `json:"owner_id" validate:"required,hexadecimal,len=24"`
}

func (rc *RestaurantCreate) ToRestaurant(ownerId string) (*Restaurant, error) {
	ownerObjID, err := bson.ObjectIDFromHex(ownerId)
	if err != nil {
		return nil, errors.New("invalid owner_id format: " + err.Error())
	}

	restaurant := &Restaurant{
		Name:           rc.Name,
		RegistrationNo: rc.RegistrationNo,
		Address:        rc.Address.ToAddress(),
		Owner:          ownerObjID,
		Description:    rc.Description,
		Tags:           rc.Tags,
		Logo:           rc.Logo,
		Cover:          rc.Cover,
		OperatingTime:  rc.OperatingTime,
		Approved:       false,
	}

	return restaurant, nil
}

func (u *Restaurant) MarshalBSON() ([]byte, error) {
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	u.UpdatedAt = time.Now()

	type t Restaurant
	return bson.Marshal((*t)(u))
}
