# API

## REST

### Cart

- GET /cart/:userId - get the cart for the given user
- POST /cart/:userId/add - add the given item to the user cart
- DELETE /cart/:userId/:cartItemId - remove the item with the given id from the cart
- PUT /cart/:userId/:cartItemId - update item amount and other data
- DELETE /cart/:userId - clear the user cart
- POST /cart/:userId/coupon - apply the given coupon to the cart
- POST /cart/:userId/order - make the order (creates an order before payment).

### Order

- GET /order/:orderId - get the order with the given id
- DELETE /order/:orderId - cancel the order

## GRPC

- GetOrderPrice(orderId) - returns the total price of the cart
- SetPaymentStatus(orderId, transactionId) - marks the order payment as complete
- SetRestaurantStatus(orderId, accepted) - updates if the restaurant accepted the order
- SetDeliveryStatus(orderId, status) - updates the order status
- SetDeliveryDriver(orderId, driverId) - sets the delivery driver id.

## Order process

- POST /cart/:userId/order
- Make payment through payment gateway
- gateway calls SetPaymentStatus
- Order sent to restaurant
- Restaurant accepts order through SetRestaurantStatus
- Restaurant updates state when order completes using SetRestaurantStatus
  - Once order finishes, delivery service is notified
- Delivery driver assigned using SetDeliveryDriver by order service
- Update delivery state using SetDeliveryStatus by order service
