package repo

import (
	"context"
	"testing"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/yehan2002/is/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type orderTest struct{}

func TestOrder(t *testing.T) {
	is.Suite(t, &orderTest{})
}

func (o *orderTest) TestCreateFromCart(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	itemId := bson.NewObjectID().Hex()
	userId := bson.NewObjectID().Hex()
	couponId := bson.NewObjectID().Hex()
	itemData := map[string]any{"a": int32(1)}

	// setup cart
	cartRepo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is.Ok(err, "failed to create cart repo")
	_, err = cartRepo.AddItem(context.TODO(), userId, itemId, 10, itemData)
	is.Ok(err, "failed to add item")
	cart, err := cartRepo.SetCartCoupon(context.TODO(), userId, couponId)
	is.Ok(err, "failed to apply coupon")

	repo, err := NewOrderRepo(db, cartRepo, NewRestaurantRepo(), NewDeliveryRepo())
	is.Ok(err, "failed to create repo")

	orderId, err := repo.CreateOrderFromCart(context.TODO(), userId, &models.Address{})
	is.Ok(err, "failed to create order")
	is(orderId != bson.NilObjectID, "invalid obj id")

	order, err := repo.GetOrderById(context.TODO(), orderId)
	is.Ok(err, "failed to get order")

	is(len(order.Items) == len(cart.Items), "invalid item amount")
	is(order.Items[0].ItemId == cart.Items[0].ItemId, "invalid item data")
	is(order.Items[0].Amount == cart.Items[0].Amount, "invalid item data")
	is(order.Items[0].Price == cart.Items[0].Price, "invalid item data")
	is(order.Items[0].Name == cart.Items[0].Name, "invalid item data")
	is.Equal(order.Items[0].Extra, cart.Items[0].Extra, "invalid item data")

	is(order.Coupon != nil, "coupon was not set")
	is.Equal(order.Coupon.CouponId, couponId, "incorrect coupon id")
}

func (o *orderTest) TestOrderPaymentSuccess(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	cartRepo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is.Ok(err, "failed to create cart repo")
	repo, err := NewOrderRepo(db, cartRepo, NewRestaurantRepo(), NewDeliveryRepo())
	is.Ok(err, "failed to create repo")

	orderId, err := repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusPaymentPending,
	})
	is.Ok(err, "Failed to create order")

	err = repo.UpdatePaymentStatus(context.TODO(), orderId, true, "abc123")
	is.Ok(err, "Failed to update status")

	order, err := repo.GetOrderById(context.TODO(), orderId)
	is.Ok(err, "Failed to get order")

	is(order.Status == models.StatusPendingAccept, "incorrect status")
	is(order.TransactionId == "abc123", "incorrect transaction id")

	err = repo.UpdatePaymentStatus(context.TODO(), orderId, true, "abc123")
	is.Err(err, ErrStateChange, "should fail to update payment status multiple times")
}

func (o *orderTest) TestOrderCancel(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	// setup repos
	cartRepo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is.Ok(err, "failed to create cart repo")
	repo, err := NewOrderRepo(db, cartRepo, NewRestaurantRepo(), NewDeliveryRepo())
	is.Ok(err, "failed to create repo")

	// create order
	orderId, err := repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusPaymentPending,
	})
	is.Ok(err, "Failed to create order")

	err = repo.CancelOrder(context.Background(), orderId)
	is.Ok(err, "Failed to cancel order")

	orderId, err = repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusPreparing,
	})
	is.Ok(err, "Failed to create order")

	err = repo.CancelOrder(context.Background(), orderId)
	is.Err(err, ErrCannotCancelOrder, "should not allow canceling order")
}

func (o *orderTest) TestOrderAccept(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	// setup repos
	cartRepo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is.Ok(err, "failed to create cart repo")
	repo, err := NewOrderRepo(db, cartRepo, NewRestaurantRepo(), NewDeliveryRepo())
	is.Ok(err, "failed to create repo")

	// create order
	orderId, err := repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusPendingAccept,
	})
	is.Ok(err, "Failed to create order")

	err = repo.UpdateAcceptedStatus(context.Background(), orderId, true, "")
	is.Ok(err, "Failed to accept order")

	orderId, err = repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusCanceled,
	})
	is.Ok(err, "Failed to create order")

	err = repo.UpdateAcceptedStatus(context.Background(), orderId, false, "")
	is.Err(err, ErrStateChange, "should not allow changing status order")
}

func (o *orderTest) TestOrderSetDriver(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	// setup repos
	cartRepo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is.Ok(err, "failed to create cart repo")
	repo, err := NewOrderRepo(db, cartRepo, NewRestaurantRepo(), NewDeliveryRepo())
	is.Ok(err, "failed to create repo")

	// create order
	orderId, err := repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusAwaitingPickup,
	})
	is.Ok(err, "Failed to create order")

	err = repo.SetDeliveryDriver(context.Background(), orderId, "driver-id")
	is.Ok(err, "Failed to set driver")

	orderId, err = repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusCanceled,
	})
	is.Ok(err, "Failed to create order")

	err = repo.SetDeliveryDriver(context.Background(), orderId, "driver-id")
	is.Err(err, ErrStateChange, "should not allow changing status order")
}

func (o *orderTest) TestOrderSetDeliveryComplete(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	// setup repos
	cartRepo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is.Ok(err, "failed to create cart repo")
	repo, err := NewOrderRepo(db, cartRepo, NewRestaurantRepo(), NewDeliveryRepo())
	is.Ok(err, "failed to create repo")

	// create order
	orderId, err := repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusDelivering,
	})
	is.Ok(err, "Failed to create order")

	err = repo.SetOrderDelivered(context.Background(), orderId)
	is.Ok(err, "Failed to set driver")

	orderId, err = repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusCanceled,
	})
	is.Ok(err, "Failed to create order")

	err = repo.SetOrderDelivered(context.Background(), orderId)
	is.Err(err, ErrStateChange, "should not allow changing status order")
}

func (o *orderTest) TestOrderPrepareDone(is is.Is) {
	db, close := database.ConnectTestDB()
	defer close()

	// setup repos
	cartRepo, err := NewCartRepo(db, NewItemRepo(), NewPromoRepo())
	is.Ok(err, "failed to create cart repo")
	repo, err := NewOrderRepo(db, cartRepo, NewRestaurantRepo(), NewDeliveryRepo())
	is.Ok(err, "failed to create repo")

	// create order
	orderId, err := repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusPreparing,
	})
	is.Ok(err, "Failed to create order")

	err = repo.SetOrderPickupReady(context.Background(), orderId)
	is.Ok(err, "Failed to set pickup ready")

	orderId, err = repo.CreateOrder(context.TODO(), &models.Order{
		UserId: "12314124",
		Total:  100,
		Status: models.StatusCanceled,
	})
	is.Ok(err, "Failed to create order")

	err = repo.SetOrderPickupReady(context.Background(), orderId)
	is.Err(err, ErrStateChange, "should not allow changing status order")
}
