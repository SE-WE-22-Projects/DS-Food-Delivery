package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Cart struct {
	CartId    bson.ObjectID  `json:"-" bson:"_id,omitempty"`
	UserId    bson.ObjectID  `json:"user_id" bson:"user_id"`
	CartItems []CartItem     `json:"-" bson:"items"`
	CouponId  *bson.ObjectID `json:"-" bson:"coupon_id"`

	// the following fields are not stored in the db.
	// These values will be added by fetching the data from menu and promotion microservices.
	Items      []DisplayItem `json:"items" bson:"-"`
	Coupon     *Coupon       `json:"coupon" bson:"-"`
	TotalPrice float64       `json:"total" bson:"-"`
}

type Coupon struct {
	CouponId    bson.ObjectID
	Name        string
	Description string
	Discount    float64
}

type CartItem struct {
	ItemId     bson.ObjectID  `json:"item_id" bson:"item_id"`
	CartItemId bson.ObjectID  `json:"cart_id" bson:"cart_id"`
	Amount     int            `json:"amount" bson:"amount"`
	Extra      map[string]any `json:"extra" bson:"extra"`
}

type DisplayItem struct {
	CartItem
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

type Item struct {
	ItemId      bson.ObjectID `json:"item_id" bson:"item_id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Price       float64       `json:"price"`
}
