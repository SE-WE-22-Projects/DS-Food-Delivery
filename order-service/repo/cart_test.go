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

	itemId := bson.NewObjectID().Hex()
	userId := bson.NewObjectID().Hex()
	itemData := map[string]any{"a": int32(1)}

	repo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is(err == nil, "failed to create repo")

	cart, err := repo.AddItem(context.TODO(), userId, itemId, 10, itemData)
	is(err == nil, "failed to add item: %s", err)

	is(len(cart.Items) == 1, "invalid item number of items in cart")
	is(cart.Items[0].ItemId == itemId, "incorrect item id")
	is(cart.Items[0].Amount == 10, "incorrect item amount")
	is.Equal(cart.Items[0].Extra, itemData, "invalid item data")

	cart2, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is.Equal(cart, cart2, "GetCart and AddToCart returned different carts")
}

func (c *cartTest) TestAddToCartMultiple(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	itemId1 := bson.NewObjectID().Hex()
	itemId2 := bson.NewObjectID().Hex()
	userId := bson.NewObjectID().Hex()

	repo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is(err == nil, "failed to create repo")

	_, err = repo.AddItem(context.TODO(), userId, itemId1, 15, nil)
	is(err == nil, "failed to add item")

	cart, err := repo.AddItem(context.TODO(), userId, itemId2, 12, nil)
	is(err == nil, "failed to add item")

	is(len(cart.Items) == 2, "invalid item number of items in cart")
}

func (c *cartTest) TestGetEmptyCart(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID().Hex()

	cart, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is(cart.UserId == userId, "invalid user id")
	is(len(cart.Items) == 0, "cart should be empty")
}

func (c *cartTest) TestRemoveItem(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID().Hex()
	itemId := bson.NewObjectID().Hex()

	cart, err := repo.AddItem(context.TODO(), userId, itemId, 15, nil)
	is(err == nil, "failed to add item")

	err = repo.RemoveItem(context.TODO(), userId, cart.Items[0].CartItemId)
	is(err == nil, "failed to remove item")

	updatedCart, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is(len(updatedCart.Items) == 0, "cart should be empty: %v, %s", updatedCart, cart.Items[0].CartItemId)
}

func (c *cartTest) TestCartApplyCoupon(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID().Hex()
	couponId := bson.NewObjectID().Hex()

	cart, err := repo.SetCartCoupon(context.TODO(), userId, couponId)
	is(err == nil, "failed to apply coupon")
	is(cart.Coupon != nil, "coupon id should be set")
	is(cart.Coupon.CouponId == couponId, "invalid coupon code")

	updatedCart, err := repo.GetCartByUserId(context.TODO(), userId)
	is(err == nil, "failed to get cart")
	is.Equal(updatedCart, cart, "different carts")
}

func (c *cartTest) TestUpdateItem(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	repo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is(err == nil, "failed to create repo")
	userId := bson.NewObjectID().Hex()
	itemId := bson.NewObjectID().Hex()
	itemId2 := bson.NewObjectID().Hex()
	itemData := map[string]any{"a": int32(1)}

	_, err = repo.AddItem(context.TODO(), userId, itemId, 15, nil)
	is(err == nil, "failed to add item")

	cart, err := repo.AddItem(context.TODO(), userId, itemId2, 15, nil)
	is(err == nil, "failed to add item")

	newCart, err := repo.UpdateItem(context.TODO(), userId, cart.Items[0].CartItemId, 20, itemData)
	is(err == nil, "failed to update item")

	is(newCart.Items[0].Amount == 20, "amount not updated")
	is.Equal(newCart.Items[0].Extra, itemData, "itemData not updated")

	is(newCart.Items[1].Amount == 15, "incorrect item updated")
	is.Equal(newCart.Items[1].Extra, map[string]any(nil), "incorrect item updated")
}
