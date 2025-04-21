package models

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type MenuItem struct {
	Id           bson.ObjectID `json:"id" bson:"_id,omitempty"`
	RestaurentId bson.ObjectID `json:"restaurent_id" bson:"restaurent_id"`
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
	RestaurentId string `json:"restaurent_id" bson:"restaurent_id"`
	Name         string `json:"name" bson:"name"`
	Description  string `json:"description" validate:"max=500" bson:"description"`
	Price        float64 `json:"price" bson:"price"`
	Image        string `json:"image" validate:"filepath" bson:"image"`
}

func (mc *MenuItemCreate) ToMenuItem() (*MenuItem, error){
	restaurentObjectId, err := bson.ObjectIDFromHex(mc.RestaurentId)
	if err != nil {
		return nil, errors.New("invalid restaurent_id format: " + err.Error())
	}

	menuItem := &MenuItem{
		RestaurentId: restaurentObjectId,
		Name: mc.Name,
		Description: mc.Description,
		Price: mc.Price,
		Image: mc.Image,
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
