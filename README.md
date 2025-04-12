# DS-Food-Delivery

## Systems

### Auth Service - Yehan - Go

- Track sessions and refresh tokens

### User Management - Yehan - Go

- User CRUD
- Registration (email and phone verification)
- Driver Registration & confirm

### Order - Yehan - Go

- Cart
- Place orders
- Order management
  - modify/cancel order before confirm
  - track status
  - accept order (by restaurant)

### Delivery system - ?

### Restaurant - Navindu - Go

- CRUD
- Restaurant confirm
- Set open/close times
- Manage restaurant details
- Manage menu

### Promotions - Kasun - express (ts)

- CRUD
- Popular items (based on order list)
- Promotion codes (internal api for checking, public api for adding and removing)
- Analytics

### Payment gateway - Kasun - express (ts)

- Make payment (for given amount and cart id)

### Review and ratings - Induwara - express (ts)

- Restaurant review
- Item review (for item id)
- Delivery review (for order id, driver id)
- Average item/restaurant rating (internal api)

### Notification - Yehan, Navindu - express (ts)

- Send emails
- Send sms
