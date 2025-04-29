package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type OrderStatus string

const (
	// StatusPaymentPending is the initial status for the order.
	// The order will remain in this state until the payment is made.
	StatusPaymentPending OrderStatus = "payment_pending"
	// StatusPaymentFailed is the status of the order if the payment failed.
	StatusPaymentFailed OrderStatus = "payment_failed"
	// StatusCanceled is the status of the order if the user cancels the order before the user accepts the order.
	StatusCanceled OrderStatus = "canceled"
	// StatusPendingAccept is the status the order switches to after the payment succeeds.
	// It will remain in this state until the restaurant accepts or rejects the order
	StatusPendingAccept OrderStatus = "pending_restaurant_accept"
	// StatusRejected will be the status of the order if the restaurant cancels the order.
	StatusRejected OrderStatus = "restaurant_rejected"
	// StatusPreparing will be the state of the order when the restaurant accepts the order.
	// Once preparing the order completes, the state changes to [StatusAwaitingPickup].
	StatusPreparing OrderStatus = "preparing_order"
	// StatusAwaitingPickup is the state of the order until a delivery driver picks up the order.
	StatusAwaitingPickup OrderStatus = "awaiting_pickup"
	//StatusDelivering is the status of the order when the order is being delivered by a driver.
	StatusDelivering OrderStatus = "delivering"
	// StatusDelivered is the state when delivering the order completes.
	StatusDelivered OrderStatus = "delivered"
)

var AllStatuses = []OrderStatus{
	StatusPaymentPending, StatusPaymentFailed, StatusCanceled, StatusPendingAccept, StatusRejected, StatusPreparing, StatusAwaitingPickup, StatusDelivering, StatusDelivered,
}

var RestaurantStatuses = []OrderStatus{StatusRejected, StatusPreparing, StatusAwaitingPickup}

type Order struct {
	OrderId  bson.ObjectID `json:"order_id" bson:"_id,omitempty"`
	UserId   string        `json:"user_id" bson:"user_id"`
	Items    []OrderItem   `json:"items" bson:"items"`
	Coupon   *Coupon       `json:"coupon,omitempty" bson:"coupon"`
	Subtotal float64       `json:"subtotal" bson:"subtotal"`
	Total    float64       `json:"total" bson:"total"`

	Status        OrderStatus `json:"status" bson:"status"`
	TransactionId string      `json:"transaction_id,omitempty" bson:"transaction_id,omitempty"`
	RejectReason  string      `json:"restaurant_reject_reason,omitempty" bson:"res_rej_reason,omitempty"`
	Driver        string      `json:"assigned_driver,omitempty" bson:"driver,omitempty"`

	Restaurant  Restaurant `json:"restaurant" bson:"restaurant"`
	Destination Address    `json:"destination" bson:"destination"`

	DeliveryId string `json:"delivery_id,omitempty" bson:"delivery_id,omitempty"`

	CreatedAt time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time `json:"updated_at" bson:"updated_at"`
}

type OrderCoupon struct {
	CouponId string  `json:"id" bson:"id"`
	Name     string  `json:"name" bson:"name"`
	Discount float64 `json:"discount" bson:"discount"`
}

func (u *Order) MarshalBSON() ([]byte, error) {
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	u.UpdatedAt = time.Now()

	type t Order
	return bson.Marshal((*t)(u))
}
