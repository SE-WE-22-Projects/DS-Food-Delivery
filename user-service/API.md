# API Spec

## REST

### Auth

- POST /auth/login
- POST /auth/register
- OAuth endpoints

### User management

- GET /users - get a list of all users
- GET /users/:userId - get user details
- PATCH /users/:userId - update user details
- DELETE /users/:userId - delete user details
- POST /users/:userId/image - set/update user profile image
- DELETE /users/:userId/image - deletes user profile image

### Driver management

- GET /drivers/applications - get list of all driver registration requests
- PATCH /drivers/applications/:applicationId - approve or deny registration requests

- GET /drivers/:userId/register - get driver registration request for user
- GET /drivers/:userId/register/history - get driver registration request history for user
- POST /drivers/:userId/register - create driver registration for user
- DELETE /drivers/:userId/register - withdraw driver registration (for user only not for admin)

## GRPC

getUserById(userId)
