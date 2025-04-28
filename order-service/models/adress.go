package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Address struct {
	No         string `json:"no" bson:"no"`
	Street     string `json:"street" bson:"street"`
	Town       string `json:"town" bson:"town"`
	City       string `json:"city" bson:"city"`
	PostalCode string `json:"postal_code" bson:"postal_code"`

	Position Point
}

type Point struct {
	Type        string     `json:"type"`
	Coordinates [2]float64 `json:"coordinates"`
}

func (p *Point) MarshalBSON() ([]byte, error) {
	p.Type = "point"

	type t Point
	return bson.Marshal((*t)(p))
}
