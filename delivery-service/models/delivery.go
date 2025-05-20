package models

import "go.mongodb.org/mongo-driver/v2/bson"

type DeliveryState string

const (
	DeliveryStateUnclaimed  = "unclaimed"
	DeliveryStateWaiting    = "waiting"
	DeliveryStateDelivering = "delivering"
	DeliveryStateDone       = "done"
)

type Address struct {
	No         string `json:"no" bson:"no" validate:"min=1"`
	Street     string `json:"street" bson:"street" validate:"min=1"`
	Town       string `json:"town" bson:"town" validate:"min=1"`
	City       string `json:"city" bson:"city" validate:"min=1"`
	PostalCode string `json:"postal_code" bson:"postal_code" validate:"min=1"`

	Position Point `json:"position" bson:"location"`
}

type Point struct {
	Type string `json:"type" bson:"type" validate:"eq point"`
	//Coordinates contains the coordinates as [longitude, latitude]
	Coordinates [2]float64 `json:"coordinates" bson:"coordinates"`
}

type Restaurant struct {
	Id       string `json:"id" bson:"id"`
	Name     string `json:"name" bson:"name"`
	Location Point  `json:"location" bson:"location"`
}

type Delivery struct {
	Id          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	OrderId     string        `bson:"order_id" json:"order_id"`
	UserId      string        `bson:"user_id" json:"user_id"`
	Pickup      Restaurant    `bson:"pickup" json:"pickup"`
	Destination Address       `bson:"destination" json:"destination"`

	State DeliveryState `bson:"state" json:"state"`

	DriverId *string `bson:"driver_id" json:"driver_id,omitempty"`
	Position *Point  `bson:"-" json:"position,omitempty"`
}
