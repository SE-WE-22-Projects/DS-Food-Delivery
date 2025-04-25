# API

## REST

- GET /delivery/order/:deliveryId - get delivery details
- POST /delivery/driver/location - update the drivers location
- GET /delivery/order/available - get pending orders near the drivers location
- POST /delivery/order/:deliveryId/accept - accept the order
- POST /delivery/order/:deliveryId/finish - mark the order as completed
- POST /delivery/order/:deliveryId/track - get the order status and the location of the driver delivering the order

## GRPC

- AddDelivery(data) - adds a new delivery

