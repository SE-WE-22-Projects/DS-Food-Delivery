package models

import "go.mongodb.org/mongo-driver/v2/bson"

// Item contains the data returned by the menu microservice.
type Item struct {
	ItemId      string  `json:"item_id" bson:"item_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Invalid     bool    `json:"invalid,omitempty"`
	Restaurant  string  `json:"restaurant"`
}

// CartItem contains data about an item in an user's cart.
type CartItem struct {
	ItemId     string         `json:"item_id" bson:"item_id"`
	CartItemId bson.ObjectID  `json:"cart_id" bson:"cart_id"`
	Amount     int            `json:"amount" bson:"amount"`
	Extra      map[string]any `json:"extra,omitempty" bson:"extra,omitempty"`
	Restaurant string         `json:"restaurant" bson:"restaurant"`

	// Not stored in db because values can be changed by restaurant-service before checkout.
	Name        string  `json:"name" bson:"-"`
	Description string  `json:"description" bson:"-"`
	Price       float64 `json:"price" bson:"-"`
	Invalid     bool    `json:"invalid,omitempty" bson:"-"`
}

// OrderItem contains data about the data in an order.
// Unlike [CartItem], this stores the item name and price when the order was created.
type OrderItem struct {
	ItemId string         `json:"item_id" bson:"item_id"`
	Name   string         `json:"name" bson:"name"`
	Amount int            `json:"amount" bson:"amount"`
	Extra  map[string]any `json:"extra,omitempty" bson:"extra,omitempty"`
	Price  float64        `json:"price" bson:"price"`
}
