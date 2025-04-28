package repo

import (
	"context"
	"errors"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/order-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var ErrNoOrder = fmt.Errorf("order not found")
var ErrEmptyCart = fmt.Errorf("cart is empty")
var ErrStateChange = fmt.Errorf("invalid order state change")
var ErrCannotCancelOrder = fmt.Errorf("cannot cancel order")
var ErrRestaurant = fmt.Errorf("cannot order from multiple restaurants")

type TransactionId = string
type RestaurantId = string

type OrderRepo interface {
	// CreateOrderFromCart creates a order from the users current cart content.
	CreateOrderFromCart(ctx context.Context, userId UserId, location *models.Address) (bson.ObjectID, error)
	// CreateOrder creates a new order. (used for tests)
	CreateOrder(ctx context.Context, order *models.Order) (bson.ObjectID, error)
	// GetOrderById returns the order with the given id
	GetOrderById(ctx context.Context, orderId bson.ObjectID) (*models.Order, error)
	// CancelOrder cancels the given order.
	// This method can only be used before the order is accepted by the restaurant.
	CancelOrder(ctx context.Context, orderId bson.ObjectID) error
	// UpdatePaymentStatus updates the payment status of the order
	UpdatePaymentStatus(ctx context.Context, orderId bson.ObjectID, successful bool, transactionId TransactionId) error
	// UpdateAcceptedStatus updates the accepted status.
	UpdateAcceptedStatus(ctx context.Context, orderId bson.ObjectID, accepted bool, cancelReason string) error
	// SetOrderPickupReady marks the order as ready to pickup
	SetOrderPickupReady(ctx context.Context, orderId bson.ObjectID) error
	// SetDeliveryDriver sets the delivery driver that will deliver the order.
	SetDeliveryDriver(ctx context.Context, orderId bson.ObjectID, driverId UserId) error
	// SetOrderDelivered marks the order as delivered
	SetOrderDelivered(ctx context.Context, orderId bson.ObjectID) error
	// GetOrdersByRestaurant gets all orders for an restaurant
	GetOrdersByRestaurant(ctx context.Context, restaurantId RestaurantId, filter models.OrderStatus) ([]*models.Order, error)
}

type orderRepo struct {
	orders     *mongo.Collection
	client     *mongo.Client
	cart       CartRepo
	restaurant RestaurantRepo
}

// CreateOrderFromCart creates a order from the users current cart content.
func (o *orderRepo) CreateOrderFromCart(ctx context.Context, userId UserId, location *models.Address) (bson.ObjectID, error) {
	session, err := o.client.StartSession()
	if err != nil {
		return bson.NilObjectID, err
	}
	defer session.EndSession(ctx)

	orderId, err := session.WithTransaction(ctx, func(ctx context.Context) (any, error) {
		cart, err := o.cart.GetCartByUserId(ctx, userId)
		if err != nil {
			return nil, err
		}

		if len(cart.Items) == 0 {
			return nil, ErrEmptyCart
		}

		restaurantId := cart.Items[0].Restaurant
		for _, item := range cart.Items {
			if item.Restaurant != restaurantId {
				return nil, ErrRestaurant
			}
		}

		restaurant, err := o.restaurant.GetRestaurantById(ctx, restaurantId)
		if err != nil {
			return nil, err
		}

		// convert cart items to [models.OrderItem]
		orderItems := make([]models.OrderItem, len(cart.Items))
		for i, item := range cart.Items {
			orderItems[i] = models.OrderItem{
				ItemId: item.ItemId,
				Name:   item.Name,
				Amount: item.Amount,
				Extra:  item.Extra,
				Price:  item.Price,
			}
		}

		// create the order
		result, err := o.orders.InsertOne(ctx, models.Order{
			UserId:      userId,
			Items:       orderItems,
			Coupon:      cart.Coupon,
			Subtotal:    cart.SubtotalPrice,
			Total:       cart.TotalPrice,
			Destination: *location,
			Status:      models.StatusPaymentPending,
			Restaurant:  *restaurant,
		})
		if err != nil {
			return nil, err
		}

		// clear the user's cart.
		err = o.cart.ClearCart(ctx, userId)
		if err != nil {
			return nil, err
		}

		return result.InsertedID, nil
	})

	if err != nil {
		return bson.NilObjectID, err
	}

	return orderId.(bson.ObjectID), nil
}

// CreateOrder creates a new order. (used for tests)
func (o *orderRepo) CreateOrder(ctx context.Context, order *models.Order) (bson.ObjectID, error) {
	result, err := o.orders.InsertOne(ctx, order)
	if err != nil {
		return bson.NilObjectID, err
	}
	return result.InsertedID.(bson.ObjectID), nil
}

// GetOrderById returns the order with the given id
func (o *orderRepo) GetOrderById(ctx context.Context, orderId bson.ObjectID) (*models.Order, error) {
	var order models.Order

	err := o.orders.FindOne(ctx, bson.D{{Key: "_id", Value: orderId}}).Decode(&order)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNoOrder
		}
		return nil, err
	}
	return &order, nil
}

// SetDeliveryDriver sets the delivery driver that will deliver the order.
func (o *orderRepo) SetDeliveryDriver(ctx context.Context, orderId bson.ObjectID, driverId UserId) error {
	res, err := o.orders.UpdateByID(ctx, orderId, bson.A{bson.M{
		"$set": bson.D{
			updateIfStatus("status", models.StatusDelivering, models.StatusAwaitingPickup),
			updateIfStatus("driver", driverId, models.StatusAwaitingPickup),
		},
	}})
	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		// Order not found
		return ErrNoOrder
	} else if res.ModifiedCount == 0 {
		// If modified count is 0, the order was found but its status was not [StatusAwaitingPickup].
		return ErrStateChange
	}

	return nil
}

// UpdateAcceptedStatus updates the accepted status.
func (o *orderRepo) UpdateAcceptedStatus(ctx context.Context, orderId bson.ObjectID, accepted bool, cancelReason string) error {
	newState := models.StatusPreparing
	if !accepted {
		newState = models.StatusRejected
	}

	res, err := o.orders.UpdateByID(ctx, orderId, bson.A{bson.M{
		"$set": bson.D{
			updateIfStatus("status", newState, models.StatusPendingAccept),
			updateIfStatus("res_rej_reason", cancelReason, models.StatusPendingAccept),
		},
	}})
	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		// Order not found
		return ErrNoOrder
	} else if res.ModifiedCount == 0 {
		// If modified count is 0, the order was found but its status was not [StatusPaymentPending].
		return ErrStateChange
	}

	return nil
}

// SetOrderPickupReady marks the order as ready to pickup
func (o *orderRepo) SetOrderPickupReady(ctx context.Context, orderId bson.ObjectID) error {
	res, err := o.orders.UpdateByID(ctx, orderId, bson.A{bson.M{
		"$set": bson.D{
			updateIfStatus("status", models.StatusAwaitingPickup, models.StatusPreparing),
		},
	}})
	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		// Order not found
		return ErrNoOrder
	} else if res.ModifiedCount == 0 {
		// If modified count is 0, the order was found but its status was not [StatusPaymentPreparing].
		return ErrStateChange
	}

	return nil
}

// UpdateDeliveryStatus updates the delivery status of the order.
func (o *orderRepo) SetOrderDelivered(ctx context.Context, orderId bson.ObjectID) error {
	res, err := o.orders.UpdateByID(ctx, orderId, bson.A{bson.M{
		"$set": bson.D{
			updateIfStatus("status", models.StatusDelivered, models.StatusDelivering),
		},
	}})
	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		// Order not found
		return ErrNoOrder
	} else if res.ModifiedCount == 0 {
		// If modified count is 0, the order was found but its status was not [StatusDelivering].
		return ErrStateChange
	}

	return nil
}

// UpdatePaymentStatus updates the payment status of the order
func (o *orderRepo) UpdatePaymentStatus(ctx context.Context, orderId bson.ObjectID, successful bool, transactionId TransactionId) error {
	newState := models.StatusPendingAccept
	if !successful {
		newState = models.StatusPaymentFailed
	}

	res, err := o.orders.UpdateByID(ctx, orderId, bson.A{bson.M{
		"$set": bson.D{
			updateIfStatus("status", newState, models.StatusPaymentPending),
			updateIfStatus("transaction_id", transactionId, models.StatusPaymentPending),
		},
	}})
	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		// Order not found
		return ErrNoOrder
	} else if res.ModifiedCount == 0 {
		// If modified count is 0, the order was found but its status was not [StatusPaymentPending].
		return ErrStateChange
	}

	return nil
}

var canCancelStatus = []models.OrderStatus{models.StatusPaymentPending, models.StatusPendingAccept, models.StatusPaymentFailed, models.StatusCanceled}

// CancelOrder cancels the given order.
// This method can only be used before the order is accepted by the restaurant.
func (o *orderRepo) CancelOrder(ctx context.Context, orderId bson.ObjectID) error {
	res, err := o.orders.UpdateByID(ctx, orderId, bson.A{bson.M{
		"$set": bson.D{
			updateIfStatus("status", models.StatusCanceled, canCancelStatus...),
		},
	}})
	if err != nil {
		return err
	}

	if res.MatchedCount == 0 {
		// Order not found
		return ErrNoOrder
	} else if res.ModifiedCount == 0 {
		// If modified count is 0, the order was found but its status was not in a cancellable state.
		return ErrCannotCancelOrder
	}

	return nil
}

func (o *orderRepo) GetOrdersByRestaurant(ctx context.Context, restaurantId RestaurantId, status models.OrderStatus) ([]*models.Order, error) {
	var orders []*models.Order

	var filter = bson.D{{Key: "restaurant.id", Value: restaurantId}}
	if len(status) > 0 {
		filter = append(filter, bson.E{Key: "status", Value: status})
	}

	cursor, err := o.orders.Find(ctx, filter)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNoOrder
		}
		return nil, err
	}

	if err := cursor.All(ctx, &orders); err != nil {
		return nil, err
	}

	return orders, nil
}

func NewOrderRepo(db *mongo.Database, cartRepo CartRepo, restaurant RestaurantRepo) (OrderRepo, error) {
	return &orderRepo{
		orders:     db.Collection("orders"),
		cart:       cartRepo,
		restaurant: restaurant,
		client:     db.Client(),
	}, nil
}
