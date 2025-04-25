package restaurent

import (
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

// --- API Error Definitions ---

// ErrRestaurentNotFound is returned if the restaurant for the given operation is not found or already deleted.
var ErrRestaurentNotFound = fiber.NewError(fiber.StatusNotFound, "Restaurant with the given id was not found")

// ErrInvalidRestaurentId is returned when the restaurant id is missing or invalid.
var ErrInvalidRestaurentId = fiber.NewError(fiber.StatusBadRequest, "Restaurant id is not specified or is invalid")

// ErrBadRequest is returned for general validation errors or malformed requests.
var ErrBadRequest = fiber.NewError(fiber.StatusBadRequest, "Bad request")

// InternalServerError is a generic response for unexpected errors.
var InternalServerError = models.ErrorResponse{Ok: false, Error: "Internal server error"}

// --- Error Mapping ---

// Maps errors returned by RestaurentRepo to API errors.
var errorMap = map[error]error{
	repo.ErrInvalidId: ErrInvalidRestaurentId,
	repo.ErrNoRes:     ErrRestaurentNotFound,
}

type Handler struct {
	db       repo.RestaurentRepo
	validate *validate.Validator
	logger   *zap.Logger
}

// New create a new Restaurent Handler
func New(db repo.RestaurentRepo, logger *zap.Logger) (*Handler, error) {
	restaurent := &Handler{db: db, validate: validate.New(), logger: logger}
	return restaurent, nil
}

// HandleGetAllRestaurents handles sending a list of all non-deleted restaurants.
func (h *Handler) HandleGetAllRestaurents(c fiber.Ctx) error {
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

	restaurents, err := h.db.GetAllRestaurent(c.RequestCtx(), filter)
	if err != nil {
		h.logger.Error("Failed to get all restaurents", zap.Error(err))
		// Return generic internal error for unexpected DB errors
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return empty list if no restaurants found, not an error
	if restaurents == nil {
		restaurents = []models.Restaurent{}
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: restaurents})
}

func (h *Handler) HandleGetAllApprovedRestaurents(c fiber.Ctx) error {

	restaurents, err := h.db.GetAllRestaurent(c.RequestCtx(), repo.RestaurantFilterApprove)
	if err != nil {
		h.logger.Error("Failed to get all restaurents", zap.Error(err))
		// Return generic internal error for unexpected DB errors
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return empty list if no restaurants found, not an error
	if restaurents == nil {
		restaurents = []models.Restaurent{}
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: restaurents})
}

// HandleGetRestaurentById handles getting a single restaurant by its ID.
func (h *Handler) HandleGetRestaurentById(c fiber.Ctx) error {
	// Get restaurant id from the request parameters
	restaurentId := c.Params("restaurentId")
	if len(restaurentId) == 0 {
		return ErrInvalidRestaurentId
	}

	restaurent, err := h.db.GetRestaurentById(c.RequestCtx(), restaurentId)
	if err != nil {
		// Map known repository errors to API errors
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors and return internal server error
		h.logger.Error("Failed to get restaurent by ID", zap.String("restaurentId", restaurentId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: restaurent})
}

// HandleCreateRestaurent handles creating a new restaurant.
func (h *Handler) HandleCreateRestaurent(c fiber.Ctx) error {
	var req models.RestaurentCreate

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for create restaurent", zap.Error(err))
		// Provide slightly more specific error from binding
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Validate the request payload using tags defined in models.RestaurentCreate
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for create restaurent", zap.Error(err))
		// Return validation errors (consider formatting them better in production)
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Convert request model to database model using the ToRestaurent method
	restaurent, err := req.ToRestaurent()
	if err != nil {
		// This error comes from invalid OwnerID format in ToRestaurent()
		h.logger.Warn("Failed to convert RestaurentCreate to Restaurent model", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// Pass the pointer to the repository function
	restaurentId, err := h.db.CreateRestaurent(c.RequestCtx(), restaurent)
	if err != nil {
		h.logger.Error("Failed to create restaurent in DB", zap.Error(err))
		// TODO: Check for specific DB errors like duplicate keys if needed
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusCreated).JSON(models.Response{Ok: true, Data: fiber.Map{"restaurentId": restaurentId}})
}

// HandleUpdateRestaurent handles updating details of an existing restaurant.
func (h *Handler) HandleUpdateRestaurent(c fiber.Ctx) error {
	restaurentId := c.Params("restaurentId")
	if len(restaurentId) == 0 {
		return ErrInvalidRestaurentId
	}

	var req *models.RestaurentUpdate

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for update restaurent", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Validate the request payload (using tags in models.RestaurentUpdate)
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for update restaurent", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Pass the pointer to the update struct to the (assumed modified) repo function
	updatedRestaurent, err := h.db.UpdateRestaurentById(c.RequestCtx(), restaurentId, req)

	if err != nil {
		fmt.Println(err)
		if apiErr, ok := errorMap[err]; ok {
			return apiErr // Handles ErrNoRes, ErrInvalidId from repo
		}
		h.logger.Error("Failed to update restaurent", zap.String("restaurentId", restaurentId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedRestaurent})
}

// HandleUpdateLogoById handles updating the logo image URL/identifier for a restaurant.
func (h *Handler) HandleUpdateLogoById(c fiber.Ctx) error {
	restaurentId := c.Params("restaurentId")
	if len(restaurentId) == 0 {
		return ErrInvalidRestaurentId
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
	updatedRestaurent, err := h.db.UpdateLogoById(c.RequestCtx(), restaurentId, req.LogoURL)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		h.logger.Error("Failed to update restaurent logo", zap.String("restaurentId", restaurentId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return the updated restaurant document (as returned by the repo function)
	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedRestaurent})
}

// HandleUpdateCoverById handles updating the cover image URL/identifier for a restaurant.
func (h *Handler) HandleUpdateCoverById(c fiber.Ctx) error {
	restaurentId := c.Params("restaurentId")
	if len(restaurentId) == 0 {
		return ErrInvalidRestaurentId
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
	updatedRestaurent, err := h.db.UpdateCoverById(c.RequestCtx(), restaurentId, req.CoverURL)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		h.logger.Error("Failed to update restaurent cover", zap.String("restaurentId", restaurentId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return the updated restaurant document (as returned by the repo function)
	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedRestaurent})
}

// HandleDeleteRestaurentById handles soft-deleting a restaurant by its ID.
func (h *Handler) HandleDeleteRestaurentById(c fiber.Ctx) error {
	restaurentId := c.Params("restaurentId")
	if len(restaurentId) == 0 {
		return ErrInvalidRestaurentId
	}

	err := h.db.DeleteRestaurentById(c.RequestCtx(), restaurentId)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors
		h.logger.Error("Failed to delete restaurent", zap.String("restaurentId", restaurentId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return 204 No Content on successful deletion
	return c.SendStatus(fiber.StatusNoContent)
}

// ApproveRestaurentById handle Approve and Unapprove operationms by restaurent ID
func (h *Handler) ApproveRestaurentById(c fiber.Ctx) error {
	restaurentId := c.Params("restaurentId")
	if len(restaurentId) == 0 {
		return ErrInvalidRestaurentId
	}

	var req struct {
		Approved bool `json:"approved"`
	}

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind Approve request", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	err := h.db.ApproveRestaurentById(c.RequestCtx(), restaurentId, req.Approved)

	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		h.logger.Error("Failed to approve restaurent", zap.String("restaurentId", restaurentId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return the updated restaurant document (as returned by the repo function)
	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true})
}
