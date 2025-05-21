package restaurant

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/proto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/notify"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// --- API Error Definitions ---

// ErrRestaurantNotFound is returned if the restaurant for the given operation is not found or already deleted.
var ErrRestaurantNotFound = fiber.NewError(fiber.StatusNotFound, "Restaurant with the given id was not found")

// ErrInvalidRestaurantId is returned when the restaurant id is missing or invalid.
var ErrInvalidRestaurantId = fiber.NewError(fiber.StatusBadRequest, "Restaurant id is not specified or is invalid")

// ErrBadRequest is returned for general validation errors or malformed requests.
var ErrBadRequest = fiber.NewError(fiber.StatusBadRequest, "Bad request")

// InternalServerError is a generic response for unexpected errors.
var InternalServerError = models.ErrorResponse{Ok: false, Error: "Internal server error"}

// --- Error Mapping ---

// Maps errors returned by RestaurantRepo to API errors.
var errorMap = map[error]error{
	repo.ErrInvalidId: ErrInvalidRestaurantId,
	repo.ErrNoRes:     ErrRestaurantNotFound,
}

type Handler struct {
	db       repo.RestaurantRepo
	validate *validate.Validator
	logger   *zap.Logger
	notify   notify.Notify
	user     proto.UserServiceClient
}

// New create a new Restaurant Handler
func New(db repo.RestaurantRepo, logger *zap.Logger, notifyCfg notify.Config, userService string) (*Handler, error) {
	restaurant := &Handler{db: db, validate: validate.New(), logger: logger}
	err := restaurant.notify.Connect(context.TODO(), notifyCfg)
	if err != nil {
		return nil, err
	}

	con, err := grpc.NewClient(userService, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("Failed to connect to order service: %w", err)
	}
	restaurant.user = proto.NewUserServiceClient(con)
	zap.S().Infof("Connected to restaurant service at %s", userService)

	return restaurant, nil
}

// HandleGetAllRestaurants handles sending a list of all non-deleted restaurants.
func (h *Handler) HandleGetAllRestaurants(c fiber.Ctx) error {
	approve := c.Query("approve", "all")
	var filter repo.RestaurantFilter
	switch approve {
	case "true":
		filter = repo.RestaurantFilterApprove
	case "false":
		filter = repo.RestaurantFilterPending
	case "all":
		filter = repo.RestaurantFilterAll
	default:
		return ErrBadRequest
	}

	restaurants, err := h.db.GetAllRestaurant(c.RequestCtx(), filter)
	if err != nil {
		h.logger.Error("Failed to get all restaurants", zap.Error(err))
		// Return generic internal error for unexpected DB errors
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return empty list if no restaurants found, not an error
	if restaurants == nil {
		restaurants = []models.Restaurant{}
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: restaurants})
}

func (h *Handler) HandleGetAllApprovedRestaurants(c fiber.Ctx) error {

	restaurants, err := h.db.GetAllRestaurant(c.RequestCtx(), repo.RestaurantFilterApprove)
	if err != nil {
		h.logger.Error("Failed to get all restaurants", zap.Error(err))
		// Return generic internal error for unexpected DB errors
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return empty list if no restaurants found, not an error
	if restaurants == nil {
		restaurants = []models.Restaurant{}
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: restaurants})
}

// HandleGetRestaurantById handles getting a single restaurant by its ID.
func (h *Handler) HandleGetRestaurantById(c fiber.Ctx) error {
	// Get restaurant id from the request parameters
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	restaurant, err := h.db.GetRestaurantById(c.RequestCtx(), restaurantId)
	if err != nil {
		// Map known repository errors to API errors
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors and return internal server error
		h.logger.Error("Failed to get restaurant by ID", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: restaurant})
}

// HandleGetRestaurantById handles getting a single restaurant by its ID.
func (h *Handler) HandleGetRestaurantLogoById(c fiber.Ctx) error {
	// Get restaurant id from the request parameters
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	restaurant, err := h.db.GetRestaurantById(c.RequestCtx(), restaurantId)
	if err != nil {
		// Map known repository errors to API errors
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors and return internal server error
		h.logger.Error("Failed to get restaurant by ID", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	if strings.HasPrefix(restaurant.Logo, "/api/v1/uploads/public/") {
		return c.Redirect().To(restaurant.Logo)
	}

	return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{Ok: false, Error: "Logo not found"})
}

// HandleCreateRestaurant handles creating a new restaurant.
func (h *Handler) HandleCreateRestaurant(c fiber.Ctx) error {
	var req models.RestaurantCreate

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for create restaurant", zap.Error(err))
		// Provide slightly more specific error from binding
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Validate the request payload using tags defined in models.RestaurantCreate
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for create restaurant", zap.Error(err))
		// Return validation errors (consider formatting them better in production)
		return err
	}

	req.OwnerID = middleware.GetUser(c).UserId

	// Convert request model to database model using the ToRestaurant method
	restaurant, err := req.ToRestaurant(middleware.GetUser(c).UserId)
	if err != nil {
		// This error comes from invalid OwnerID format in ToRestaurant()
		h.logger.Warn("Failed to convert RestaurantCreate to Restaurant model", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// Pass the pointer to the repository function
	restaurantId, err := h.db.CreateRestaurant(c.RequestCtx(), restaurant)
	if err != nil {
		h.logger.Error("Failed to create restaurant in DB", zap.Error(err))
		// TODO: Check for specific DB errors like duplicate keys if needed
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusCreated).JSON(models.Response{Ok: true, Data: fiber.Map{"restaurantId": restaurantId}})
}

// HandleUpdateRestaurant handles updating details of an existing restaurant.
func (h *Handler) HandleUpdateRestaurant(c fiber.Ctx) error {
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	var req *models.RestaurantUpdate

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for update restaurant", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Validate the request payload (using tags in models.RestaurantUpdate)
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for update restaurant", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	if req.Address != nil {
		req.Address.Convert()
	}

	// Pass the pointer to the update struct to the (assumed modified) repo function
	updatedRestaurant, err := h.db.UpdateRestaurantById(c.RequestCtx(), restaurantId, req)

	if err != nil {
		fmt.Println(err)
		if apiErr, ok := errorMap[err]; ok {
			return apiErr // Handles ErrNoRes, ErrInvalidId from repo
		}
		h.logger.Error("Failed to update restaurant", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedRestaurant})
}

// HandleUpdateLogoById handles updating the logo image URL/identifier for a restaurant.
func (h *Handler) HandleUpdateLogoById(c fiber.Ctx) error {
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	var req struct {
		// Field name should match the expected JSON key
		LogoURL string `json:"logo_url" validate:"required,url"`
	}
	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for update logo", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for update logo", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Call the specific repo function
	updatedRestaurant, err := h.db.UpdateLogoById(c.RequestCtx(), restaurantId, req.LogoURL)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		h.logger.Error("Failed to update restaurant logo", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return the updated restaurant document (as returned by the repo function)
	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedRestaurant})
}

// HandleUpdateCoverById handles updating the cover image URL/identifier for a restaurant.
func (h *Handler) HandleUpdateCoverById(c fiber.Ctx) error {
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	var req struct {
		CoverURL string `json:"cover_url" validate:"required,url"`
	}
	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for update cover", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for update cover", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Call the specific repo function
	updatedRestaurant, err := h.db.UpdateCoverById(c.RequestCtx(), restaurantId, req.CoverURL)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		h.logger.Error("Failed to update restaurant cover", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return the updated restaurant document (as returned by the repo function)
	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedRestaurant})
}

// HandleDeleteRestaurantById handles soft-deleting a restaurant by its ID.
func (h *Handler) HandleDeleteRestaurantById(c fiber.Ctx) error {
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	err := h.db.DeleteRestaurantById(c.RequestCtx(), restaurantId)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors
		h.logger.Error("Failed to delete restaurant", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return 204 No Content on successful deletion
	return c.SendStatus(fiber.StatusNoContent)
}

// ApproveRestaurantById handle Approve and Unapprove operationms by restaurant ID
func (h *Handler) ApproveRestaurantById(c fiber.Ctx) error {
	restaurantId := c.Params("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	var req struct {
		Approved bool `json:"approved"`
	}

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind Approve request", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	err := h.db.ApproveRestaurantById(c.RequestCtx(), restaurantId, req.Approved)

	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		h.logger.Error("Failed to approve restaurant", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	restaurant, err := h.db.GetRestaurantById(c.RequestCtx(), restaurantId)
	if err != nil {
		h.logger.Error("Failed to get restaurant", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	h.sendMessage(c.RequestCtx(), restaurant.Owner.Hex(), &notify.TemplateMessage{
		Type:     notify.MsgTypeEmail,
		Template: "restaurant-approved-email",
		Content: map[string]any{
			"restaurantId":      restaurant.Id.Hex(),
			"restaurantName":    restaurant.Name,
			"restaurantAddress": restaurant.Address.Address(),
			"approvedDate":      time.Now().String(),
		},
	})

	// Return the updated restaurant document (as returned by the repo function)
	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: "Approved restaurant"})
}

func (h *Handler) HandleGetRestaurantsByOwnerId(c fiber.Ctx) error {
	ownerId := middleware.GetUser(c).UserId
	restaurants, err := h.db.GetRestaurantsByOwnerId(c.RequestCtx(), ownerId)
	if err != nil {
		h.logger.Error("Failed to get all restaurants of owner", zap.Error(err))
		// Return generic internal error for unexpected DB errors
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return empty list if no restaurants found, not an error
	if restaurants == nil {
		restaurants = []models.Restaurant{}
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: restaurants})
}

func (h *Handler) sendMessage(ctx context.Context, userID string, msg *notify.TemplateMessage) error {
	res, err := h.user.GetUserBy(ctx, &proto.UserRequest{UserId: userID})
	if err != nil {
		zap.L().Error("Failed to get user", zap.Error(err))
		return err
	}

	if msg.Type == notify.MsgTypeEmail {
		msg.To = []string{res.Email}
	} else {
		msg.To = []string{res.Mobile}
	}

	err = h.notify.Send(ctx, msg)
	if err != nil {
		zap.L().Error("Failed to send notification", zap.Error(err))
	}

	return nil
}
