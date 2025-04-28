package repo

import (
	"context"
	"errors"
	"fmt"
	"math"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ErrInvalidId indicates that the given id is invalid
var ErrInvalidId = errors.New("given Id is invalid")

var ErrNotInCart = errors.New("item is not in cart")

type UserId = string
type ItemId = string
type CouponId = string

type CartRepo interface {
	// GetCartByUserId gets the contents of the users current cart.
	GetCartByUserId(ctx context.Context, userId UserId) (*models.Cart, error)
	// AddItem adds a item to the users cart.
	// This method returns the updated cart.
	AddItem(ctx context.Context, userId UserId, itemId ItemId, amount int, data map[string]any) (*models.Cart, error)
	// RemoveItem removes an item from the cart
	RemoveItem(ctx context.Context, userId UserId, cartItemId bson.ObjectID) error
	// UpdateItem updates an item in the cart
	UpdateItem(ctx context.Context, userId UserId, cartItemId bson.ObjectID, amount int, data map[string]any) (*models.Cart, error)
	// SetCartCoupon sets the coupon code used for the cart.
	SetCartCoupon(ctx context.Context, userId UserId, couponId CouponId) (*models.Cart, error)
	// ClearCart clears the cart of the user
	ClearCart(ctx context.Context, userId UserId) error
}

type cartRepo struct {
	db     *mongo.Collection
	items  ItemRepo
	promos PromotionRepo
}

// AddItem adds a item to the users cart.
// This method returns the updated cart.
func (c *cartRepo) AddItem(ctx context.Context, userId UserId, itemId ItemId, amount int, data map[string]any) (*models.Cart, error) {
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

	if err := c.populateCart(ctx, &cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

// GetCartByUserId gets the contents of the users current cart.
func (c *cartRepo) GetCartByUserId(ctx context.Context, userId UserId) (*models.Cart, error) {
	result := c.db.FindOne(ctx, bson.D{{Key: "user_id", Value: userId}})
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			// Return empty cart if no cart exists
			return &models.Cart{UserId: userId, Items: []models.CartItem{}}, nil
		}
		return nil, err
	}

	var cart models.Cart
	if err := result.Decode(&cart); err != nil {
		return nil, err
	}

	if err := c.populateCart(ctx, &cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

// RemoveItem removes an item from the cart
func (c *cartRepo) RemoveItem(ctx context.Context, userId UserId, cartItemId bson.ObjectID) error {
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
func (c *cartRepo) UpdateItem(ctx context.Context, userId UserId, cartItemId bson.ObjectID, amount int, data map[string]any) (*models.Cart, error) {
	res := c.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "user_id", Value: userId}, {Key: "items.cart_id", Value: cartItemId}},
		bson.M{
			"$set": bson.M{
				"items.$.amount": amount,
				"items.$.extra":  data,
			},
		}, options.FindOneAndUpdate().SetReturnDocument(options.After))

	if res.Err() != nil {
		if errors.Is(res.Err(), mongo.ErrNoDocuments) {
			return nil, ErrNotInCart
		}

		return nil, res.Err()
	}

	var cart models.Cart
	if err := res.Decode(&cart); err != nil {
		return nil, err
	}

	if err := c.populateCart(ctx, &cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

// SetCartCoupon sets the coupon code used for the cart.
func (c *cartRepo) SetCartCoupon(ctx context.Context, userId UserId, couponId CouponId) (*models.Cart, error) {
	var couponData bson.M
	if len(couponId) != 0 {
		couponData = bson.M{"coupon": models.Coupon{CouponId: couponId}}
	} else {
		couponData = bson.M{"coupon": nil}
	}

	result := c.db.FindOneAndUpdate(ctx,
		bson.D{{Key: "user_id", Value: userId}},
		bson.M{
			"$set":         couponData,
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

	if err := c.populateCart(ctx, &cart); err != nil {
		return nil, err
	}

	return &cart, nil
}

// ClearCart clears the cart of the user
func (c *cartRepo) ClearCart(ctx context.Context, userId UserId) error {
	_, err := c.db.DeleteOne(ctx, bson.D{{Key: "user_id", Value: userId}})
	return err
}

// populateCart populates item details and coupon details by fetching the data over grpc
func (c *cartRepo) populateCart(ctx context.Context, cart *models.Cart) error {
	var subtotalPrice float64
	var totalPrice float64

	if len(cart.Items) > 0 {
		ids := make([]string, len(cart.Items))
		for i, item := range cart.Items {
			ids[i] = item.ItemId
		}

		// create item data map from items fetched from the item repo
		itemData := make(map[string]*models.Item)
		{
			itemArray, err := c.items.GetItemsById(ctx, ids)
			if err != nil {
				return err
			}
			for _, item := range itemArray {
				itemData[item.ItemId] = &item
			}
		}

		for i := range cart.Items {
			item := &cart.Items[i]

			data, ok := itemData[item.ItemId]
			if !ok {
				return fmt.Errorf("no data for item %s", item.ItemId)
			}

			// merge data from cart.CartItems and itemData
			item.Name = data.Name
			item.Description = data.Description
			item.Price = data.Price
			item.Restaurant = data.Restaurant
			item.Invalid = data.Invalid

			// update total price
			subtotalPrice += data.Price * float64(item.Amount)
		}
	}

	if cart.Coupon != nil {
		// get promotion from the promotion repo
		promo, err := c.promos.GetPromoById(cart.Coupon.CouponId)
		if err != nil {
			return err
		}
		cart.Coupon = promo

		// apply discount to total price
		discount := (100 - math.Min(math.Max(1, promo.Discount), 99)) / 100
		totalPrice = subtotalPrice * discount
	} else {
		totalPrice = subtotalPrice
	}

	cart.TotalPrice = totalPrice
	cart.SubtotalPrice = subtotalPrice
	return nil
}

func NewCartRepo(db *mongo.Database, itemRepo ItemRepo, promos PromotionRepo) (CartRepo, error) {
	collection := db.Collection("carts")
	return &cartRepo{db: collection, items: itemRepo, promos: promos}, nil
}
