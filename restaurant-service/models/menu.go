package models

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type MenuItem struct {
	Id           bson.ObjectID `json:"id" bson:"_id,omitempty"`
	RestaurantId bson.ObjectID `json:"restaurant_id" bson:"restaurant_id"`
	Name         string        `json:"name" bson:"name"`
	Description  string        `json:"description" bson:"description"`
	Price        float64       `json:"price" bson:"price"`
	Image        string        `json:"image" bson:"image"`
	CreatedAt    time.Time     `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at" bson:"updated_at"`
	DeletedAt    *time.Time    `json:"deleted_at,omitempty" bson:"deleted_at,omitempty"`
}

type MenuItemUpdate struct {
	Name        string  `json:"name" validate:"omitempty,min=2,max=100" bson:"name"`
	Description string  `json:"description" validate:"omitempty,max=500" bson:"description"`
	Price       float64 `json:"price" validate:"omitempty" bson:"price"`
	Image       string  `json:"image" validate:"omitempty,filepath" bson:"image"`
}

type MenuItemCreate struct {
	RestaurantId string  `json:"restaurant_id" bson:"restaurant_id"`
	Name         string  `json:"name" bson:"name" validate:"min=4,max=100"`
	Description  string  `json:"description" validate:"max=500" bson:"description"`
	Price        float64 `json:"price" bson:"price" validate:"min=1,max=100000"`
	Image        string  `json:"image" validate:"filepath" bson:"image"`
}

func (mc *MenuItemCreate) ToMenuItem() (*MenuItem, error) {
	restaurantObjectId, err := bson.ObjectIDFromHex(mc.RestaurantId)
	if err != nil {
		return nil, errors.New("invalid restaurant_id format: " + err.Error())
	}

	menuItem := &MenuItem{
		RestaurantId: restaurantObjectId,
		Name:         mc.Name,
		Description:  mc.Description,
		Price:        mc.Price,
		Image:        mc.Image,
	}

	return menuItem, nil
}

func (m *MenuItem) MarshalBSON() ([]byte, error) {
	if m.CreatedAt.IsZero() {
		m.CreatedAt = time.Now()
	}
	m.UpdatedAt = time.Now()

	type t MenuItem
	return bson.Marshal((*t)(m))
}
