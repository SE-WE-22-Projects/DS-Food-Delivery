package models

import (
	"fmt"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Address struct {
	No         string `json:"no" bson:"no" validate:"min=1"`
	Street     string `json:"street" bson:"street" validate:"min=1"`
	Town       string `json:"town" bson:"town" validate:"min=1"`
	City       string `json:"city" bson:"city" validate:"min=1"`
	PostalCode string `json:"postal_code" bson:"postal_code" validate:"min=1"`

	Position Point `json:"position" bson:"location"`
}

func (a *Address) Address() string {
	return fmt.Sprintf("%s, %s, %s, %s, Sri Lanka %s", a.No, a.Street, a.Town, a.City, a.PostalCode)
}

type Point struct {
	Type        string     `json:"type" bson:"type"`
	Coordinates [2]float64 `json:"coordinates" bson:"coordinates"`
}

func (p *Point) MarshalBSON() ([]byte, error) {
	p.Type = "point"

	type t Point
	return bson.Marshal((*t)(p))
}
