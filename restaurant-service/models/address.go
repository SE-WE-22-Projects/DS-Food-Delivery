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

type RequestAddress struct {
	No         string `json:"no" bson:"no" validate:"min=1"`
	Street     string `json:"street" bson:"street" validate:"min=1"`
	Town       string `json:"town" bson:"town" validate:"min=1"`
	City       string `json:"city" bson:"city" validate:"min=1"`
	PostalCode string `json:"postal_code" bson:"postal_code" validate:"min=1"`
	Coords     struct {
		Longitude float64 `json:"lng"`
		Latitude  float64 `json:"lat"`
	} `json:"position" bson:"-"`

	Position Point `json:"-" bson:"location"`
}

func (a *RequestAddress) Convert() {
	a.Position = Point{Coordinates: [2]float64{a.Coords.Latitude, a.Coords.Longitude}, Type: "point"}
}

func (a *RequestAddress) ToAddress() Address {
	a.Convert()

	return Address{No: a.No, Street: a.Street, Town: a.Town, City: a.City, PostalCode: a.PostalCode, Position: a.Position}
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
