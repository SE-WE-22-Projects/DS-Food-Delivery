package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Cart struct {
	CartId bson.ObjectID `json:"-" bson:"_id,omitempty"`
	UserId string        `json:"user_id" bson:"user_id"`
	Items  []CartItem    `json:"items" bson:"items"`
	Coupon *Coupon       `json:"coupon,omitempty" bson:"coupon"`

	// the following fields are not stored in the db.
	// These values will be added by fetching the data from menu and promotion microservices.
	TotalPrice float64 `json:"total" bson:"-"`
}

type Coupon struct {
	CouponId string `json:"id" bson:"id"`

	// Not stored in db
	Name        string  `json:"name" bson:"-"`
	Description string  `json:"description" bson:"-"`
	Discount    float64 `json:"discount" bson:"-"`
}
