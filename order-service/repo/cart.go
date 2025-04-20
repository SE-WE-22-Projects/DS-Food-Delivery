package repo

import (
	"context"
	"errors"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ErrInvalidId indicates that the given id is invalid
var ErrInvalidId = errors.New("given Id is invalid")

type CartRepo interface {
	// GetCartByUserId gets the contents of the users current cart.
	GetCartByUserId(ctx context.Context, userId bson.ObjectID) (*models.Cart, error)
	// AddItem adds a item to the users cart.
	// This method returns the updated cart.
	AddItem(ctx context.Context, userId bson.ObjectID, itemId bson.ObjectID, amount int, data map[string]any) (*models.Cart, error)
	// RemoveItem removes an item from the cart
	RemoveItem(ctx context.Context, userId bson.ObjectID, itemId bson.ObjectID) error
	// UpdateItem updates an item in the cart
	UpdateItem(ctx context.Context, userId bson.ObjectID, cartItemId bson.ObjectID, amount int, data map[string]any) (*models.Cart, error)
	// SetCartCoupon sets the coupon code used for the cart.
	SetCartCoupon(ctx context.Context, userId bson.ObjectID, couponId bson.ObjectID) (*models.Cart, error)
}

type cartRepo struct {
	db *mongo.Collection
}

// AddItem adds a item to the users cart.
// This method returns the updated cart.
func (c *cartRepo) AddItem(ctx context.Context, userId bson.ObjectID, itemId bson.ObjectID, amount int, data map[string]any) (*models.Cart, error) {

	result := c.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "user_id", Value: userId}},
		bson.D{
			bson.E{Key: "$push", Value: bson.D{{Key: "items", Value: models.CartItem{
				ItemId:     itemId,
				CartItemId: bson.NewObjectID(),
				Amount:     amount,
				Extra:      data,
			}}}},
			bson.E{Key: "$setOnInsert", Value: bson.D{bson.E{Key: "user_id", Value: userId}}},
		},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	)

	if result.Err() != nil {
		return nil, result.Err()
	}

	var cart models.Cart
	if err := result.Decode(&cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

// GetCartByUserId gets the contents of the users current cart.
func (c *cartRepo) GetCartByUserId(ctx context.Context, userId bson.ObjectID) (*models.Cart, error) {
	result := c.db.FindOne(ctx, bson.D{{Key: "user_id", Value: userId}})
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			// Return empty cart if no cart exists
			return &models.Cart{UserId: userId}, nil
		}
		return nil, err
	}

	var cart models.Cart
	if err := result.Decode(&cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

// RemoveItem removes an item from the cart
func (c *cartRepo) RemoveItem(ctx context.Context, userId bson.ObjectID, cartItemId bson.ObjectID) error {
	res := c.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "user_id", Value: userId}},
		bson.M{
			"$pull": bson.M{
				"items": bson.M{
					"cart_id": cartItemId,
				}},
		})

	if res.Err() != nil {
		return res.Err()
	}

	return nil
}

// UpdateItem updates an item in the cart
func (c *cartRepo) UpdateItem(ctx context.Context, userId bson.ObjectID, cartItemId bson.ObjectID, amount int, data map[string]any) (*models.Cart, error) {
	res := c.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "user_id", Value: userId}, {Key: "items.cart_id", Value: cartItemId}},
		bson.M{
			"$set": bson.M{
				"items.$.amount": amount,
				"items.$.extra":  data,
			},
		}, options.FindOneAndUpdate().SetReturnDocument(options.After))

	if res.Err() != nil {
		return nil, res.Err()
	}

	var cart models.Cart
	if err := res.Decode(&cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

// SetCartCoupon sets the coupon code used for the cart.
func (c *cartRepo) SetCartCoupon(ctx context.Context, userId bson.ObjectID, couponId bson.ObjectID) (*models.Cart, error) {
	result := c.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "user_id", Value: userId}},
		bson.M{
			"$set":         bson.M{"coupon_id": couponId},
			"$setOnInsert": bson.D{bson.E{Key: "user_id", Value: userId}},
		},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	)

	if result.Err() != nil {
		return nil, result.Err()
	}

	var cart models.Cart
	if err := result.Decode(&cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

func NewCartRepo(db *mongo.Database) (CartRepo, error) {
	collection := db.Collection("carts")
	return &cartRepo{db: collection}, nil
}
