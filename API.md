# API

## REST

### Delivery service

- GET /api/v1/delivery/order/:deliveryId - get delivery details
- POST /api/v1/delivery/driver/location - update the drivers location
- GET /api/v1/delivery/order/available - get pending orders near the drivers location
- POST /api/v1/delivery/order/:deliveryId/accept - accept the order
- POST /api/v1/delivery/order/:deliveryId/finish - mark the order as completed
- POST /api/v1/delivery/order/:deliveryId/track - get the order status and the location of the driver delivering the order

### Order service

- GET /api/v1/cart/:userId - get the cart for the given user
- POST /api/v1/cart/:userId/items - add the given item to the user cart
- DELETE /api/v1/cart/:userId/items/:cartItemId - remove the item with the given id from the cart
- PUT /api/v1/cart/:userId/items/:cartItemId - update item amount and other data
- DELETE /api/v1/cart/:userId - clear the user cart
- POST /api/v1/cart/:userId/coupon - apply the given coupon to the cart
- POST /api/v1/order/from-cart/:userId - make the order (creates an order before payment).
- GET /api/v1/order/:orderId - get the order with the given id
- DELETE /api/v1/order/:orderId - cancel the order

### Payment Service

- POST /api/v1/payments/:orderId - start payment for order
- GET /api/v1/payments/done?session_id= - callback url for stripe

### Restaurant Service

- GET /api/v1/restaurants/ – Get all restaurants
- POST /api/v1/restaurants/ – Create a new restaurant
- GET /api/v1/restaurants/owner – Get restaurants by owner ID
- GET /api/v1/restaurants/:restaurantId – Get a specific restaurant by ID
- PATCH /api/v1/restaurants/:restaurantId/approve – Approve a restaurant
- GET /api/v1/restaurants/all – Get all restaurants with admin role
- PATCH /api/v1/restaurants/:restaurantId/ – Update restaurant
- PUT /api/v1/restaurants/:restaurantId/logo – Update logo
- PUT /api/v1/restaurants/:restaurantId/cover – Update cover image
- DELETE /api/v1/restaurants/:restaurantId/ – Delete restaurant
- GET /api/v1/menu/ – Get all menu items
- GET /api/v1/menu/restaurant/:restaurantId – Get menu items for a specific restaurant
- GET /api/v1/menu/:menuItemId – Get a specific menu item
- POST /api/v1/menu/ – Create a new menu item
- PATCH /api/v1/menu/:menuItemId/ – Update a menu item
- PATCH /api/v1/menu/:menuItemId/image – Update menu item image
- DELETE /api/v1/menu/:menuItemId/ – Delete menu item

### Review Service

- POST /api/v1/delivery/ - Create a new delivery review
- GET /api/v1/delivery/ -Get all delivery reviews
- GET /api/v1/delivery/:id - Get a specific delivery review by ID
- GET /api/v1/delivery/user/:userId - Get reviews by user ID
- GET /api/v1/delivery/food/:foodId/reviews - Get reviews by food ID
- GET /api/v1/delivery/food/:foodId/rating - Get average rating for a specific food
- GET /api/v1/delivery/foods/ratings - Get all foods with their average ratings
- PUT /api/v1/delivery/:id - Update a delivery review
- DELETE /api/v1/delivery/:id - Delete a delivery review

### Upload Service

- GET /api/v1/uploads/public/:date/:uuid - Get public file
- GET /api/v1/uploads/private/:userId/:uuid - Get private file
- POST /api/v1/uploads/public - Upload public file
- POST /api/v1/uploads/private/:userId - Upload private file

### User Service

- POST /api/v1/auth/login - Login
- POST /api/v1/auth/register - Register
- POST /api/v1/auth/refresh - Refresh session
- GET /api/v1/users - get a list of all users
- GET /api/v1/users/:userId - get user details
- PATCH /api/v1/users/:userId - update user details
- DELETE /api/v1/users/:userId - delete user details
- POST /api/v1/users/:userId/image - set/update user profile image
- DELETE /api/v1/users/:userId/image - deletes user profile image
- GET /api/v1/drivers/applications - get list of all driver registration requests
- PATCH /api/v1/drivers/applications/:applicationId - approve or deny registration requests
- GET /api/v1/drivers/:userId/register - get driver registration request for user
- GET /api/v1/drivers/:userId/register/history - get driver registration request history for user
- POST /api/v1/drivers/:userId/register - create driver registration for user
- DELETE /api/v1/drivers/:userId/register - withdraw driver registration (for user only not for admin)

## GRPC

### Delivery Service

- AddDelivery(data) - adds a new delivery

### Order Service

- GetOrderPrice(orderId) - returns the total price of the cart
- SetPaymentStatus(orderId, transactionId) - marks the order payment as complete
- SetRestaurantStatus(orderId, accepted) - updates if the restaurant accepted the order
- SetDeliveryStatus(orderId, status) - updates the order status
- SetDeliveryDriver(orderId, driverId) - sets the delivery driver id.

### Restaurant Service

- GetItemsById(ids) - Get item data for multiple items
- GetRestaurantById(id) - Get restaurant details

### User Service

- getUserById(userId) - Get user details
