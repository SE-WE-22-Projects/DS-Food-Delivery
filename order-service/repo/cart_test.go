package repo

import (
	"context"
	"testing"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/yehan2002/is/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type cartTest struct{}

func TestCartRepo(t *testing.T) {
	is.Suite(t, &cartTest{})
}

func (c *cartTest) TestAddToCart(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	itemId := bson.NewObjectID()
	userId := bson.NewObjectID()
	itemData := map[string]any{"a": int32(1)}

	repo, err := NewCartRepo(db)
	is(err == nil, "failed to create repo")

	cart, err := repo.AddItem(context.TODO(), userId, itemId, 10, itemData)
	is(err == nil, "failed to add item: %s", err)

	is(len(cart.CartItems) == 1, "invalid item number of items in cart")
	is(cart.CartItems[0].ItemId == itemId, "incorrect item id")
	is(cart.CartItems[0].Amount == 10, "incorrect item amount")
	is.Equal(cart.CartItems[0].Extra, itemData, "invalid item data")

	cart2, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is.Equal(cart, cart2, "GetCart and AddToCart returned different carts")
}

func (c *cartTest) TestAddToCartMultiple(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	itemId1 := bson.NewObjectID()
	itemId2 := bson.NewObjectID()
	userId := bson.NewObjectID()

	repo, err := NewCartRepo(db)
	is(err == nil, "failed to create repo")

	_, err = repo.AddItem(context.TODO(), userId, itemId1, 15, nil)
	is(err == nil, "failed to add item")

	cart, err := repo.AddItem(context.TODO(), userId, itemId2, 12, nil)
	is(err == nil, "failed to add item")

	is(len(cart.CartItems) == 2, "invalid item number of items in cart")
}

func (c *cartTest) TestGetEmptyCart(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db)
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID()

	cart, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is(cart.UserId == userId, "invalid user id")
	is(len(cart.CartItems) == 0, "cart should be empty")
}

func (c *cartTest) TestRemoveItem(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db)
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID()
	itemId := bson.NewObjectID()

	cart, err := repo.AddItem(context.TODO(), userId, itemId, 15, nil)
	is(err == nil, "failed to add item")

	err = repo.RemoveItem(context.TODO(), userId, cart.CartItems[0].CartItemId)
	is(err == nil, "failed to remove item")

	updatedCart, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is(len(updatedCart.CartItems) == 0, "cart should be empty: %v, %s", updatedCart, cart.CartItems[0].CartItemId)
}

func (c *cartTest) TestCartApplyCoupon(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db)
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID()
	couponId := bson.NewObjectID()

	cart, err := repo.SetCartCoupon(context.TODO(), userId, couponId)
	is(err == nil, "failed to apply item")
	is(cart.CouponId != nil, "coupon id should be set")
	is(*cart.CouponId == couponId, "invalid coupon code")

	updatedCart, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is.Equal(updatedCart, cart, "different carts")
}

func (c *cartTest) TestUpdateItem(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db)
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID()
	itemId := bson.NewObjectID()
	itemId2 := bson.NewObjectID()
	itemData := map[string]any{"a": int32(1)}

	_, err = repo.AddItem(context.TODO(), userId, itemId, 15, nil)
	is(err == nil, "failed to add item")

	cart, err := repo.AddItem(context.TODO(), userId, itemId2, 15, nil)
	is(err == nil, "failed to add item")

	newCart, err := repo.UpdateItem(context.TODO(), userId, cart.CartItems[0].CartItemId, 20, itemData)
	is(err == nil, "failed to update item")

	is(newCart.CartItems[0].Amount == 20, "amount not updated")
	is.Equal(newCart.CartItems[0].Extra, itemData, "itemData not updated")

	is(newCart.CartItems[1].Amount == 15, "incorrect item updated")
	is.Equal(newCart.CartItems[1].Extra, map[string]any(nil), "incorrect item updated")
}
