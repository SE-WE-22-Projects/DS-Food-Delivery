package repo

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// updateIfStatus creates a conditional query that updates the given field
// to the given value if the status of the order is in the statuses array.
func updateIfStatus(field string, value any, statuses ...models.OrderStatus) bson.E {
	return bson.E{
		Key: field,
		Value: bson.D{{
			Key: "$cond",
			Value: bson.D{
				{Key: "if", Value: bson.M{"$in": bson.A{"$status", statuses}}},
				{Key: "then", Value: value},
				{Key: "else", Value: "$" + field},
			},
		}},
	}

}
