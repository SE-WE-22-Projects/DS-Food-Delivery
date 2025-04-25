package menuitem

import (
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurant-service/repo"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/gofiber/fiber/v3"
	"go.uber.org/zap"
)

// --- API Error Definitions ---

// ErrMenuItemNotFound is returned if the menu item for the given operation is not found or already deleted.
var ErrMenuItemNotFound = fiber.NewError(fiber.StatusNotFound, "Menu Item with the given id was not found")

// ErrInvalidRestaurantId is returned when the restaurant id is missing or invalid.
var ErrInvalidRestaurantId = fiber.NewError(fiber.StatusBadRequest, "Restaurant id is not specified or is invalid")

// ErrInvalidMenuItemId is returned when the menu item id is missing or invalid.
var ErrInvalidMenuItemId = fiber.NewError(fiber.StatusBadRequest, "Menu Item id is not specified or is invalid")

// ErrBadRequest is returned for general validation errors or malformed requests.
var ErrBadRequest = fiber.NewError(fiber.StatusBadRequest, "Bad request")

// InternalServerError is a generic response for unexpected errors.
var InternalServerError = models.ErrorResponse{Ok: false, Error: "Internal server error"}

// --- Error Mapping ---

// Maps errors returned by RestaurantRepo to API errors.
var errorMap = map[error]error{
	repo.ErrInvalidId: ErrInvalidMenuItemId,
	repo.ErrNoMenu:    ErrMenuItemNotFound,
}

type Handler struct {
	db       repo.MenuItemRepo
	validate *validate.Validator
	logger   *zap.Logger
}

// New create a new Menu Item Handler
func New(db repo.MenuItemRepo, logger *zap.Logger) (*Handler, error) {
	menuitem := &Handler{
		db:       db,
		validate: validate.New(),
		logger:   logger,
	}

	return menuitem, nil
}

// HandleGetAllMenuItems retrieves all menu items from the database and returns them as a JSON response.
func (h *Handler) HandleGetAllMenuItems(c fiber.Ctx) error {
	menuItems, err := h.db.GetAllMenuItems(c.RequestCtx())
	if err != nil {
		h.logger.Error("Failed to get all menu items", zap.Error(err))
		// Return generic internal error for unexpected DB errors
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return empty list if no restaurants found, not an error
	if menuItems == nil {
		menuItems = []models.MenuItem{}
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: menuItems})
}

// HandleGetResturanMenuItems retrieves menu items for a specific restaurant by restaurant ID.
func (h *Handler) HandleGetResturanMenuItems(c fiber.Ctx) error {
	// Get restaurant id from the request parameters
	restaurantId := c.Query("restaurantId")
	if len(restaurantId) == 0 {
		return ErrInvalidRestaurantId
	}

	menuItems, err := h.db.GetResturanMenuItems(c.RequestCtx(), restaurantId)

	if err != nil {
		// Map known repository errors to API errors
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors and return internal server error
		h.logger.Error("Failed to get meny items by restaurant ID", zap.String("restaurantId", restaurantId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return empty list if no restaurants found, not an error
	if menuItems == nil {
		menuItems = []models.MenuItem{}
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: menuItems})
}

// HandleGetMenuItemById retrieves a single menu item by its ID.
func (h *Handler) HandleGetMenuItemById(c fiber.Ctx) error {
	// Get menu item id from the request parameters
	menuItemId := c.Params("menuItemId")
	if len(menuItemId) == 0 {
		return ErrInvalidRestaurantId
	}

	menuItem, err := h.db.GetMenuItemById(c.RequestCtx(), menuItemId)

	if err != nil {
		// Map known repository errors to API errors
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors and return internal server error
		h.logger.Error("Failed to get menu item by ID", zap.String("menuItemId", menuItemId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: menuItem})
}

// HandleCreateMenuItem creates a new menu item in the database
func (h *Handler) HandleCreateMenuItem(c fiber.Ctx) error {
	var req models.MenuItemCreate

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for create menu item", zap.Error(err))
		// Provide slightly more specific error from binding
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Validate the request payload using tags defined in models.RestaurantCreate
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for create menu item ", zap.Error(err))
		// Return validation errors (consider formatting them better in production)
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Convert request model to database model using the ToRestaurant method
	menuitem, err := req.ToMenuItem()
	if err != nil {
		// This error comes from invalid OwnerID format in ToMenuItem()
		h.logger.Warn("Failed to convert MenuItemCreate to .MenuItem model", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	menuItemId, err := h.db.CreateMenuItem(c.RequestCtx(), menuitem)
	if err != nil {
		// Handle potential DB errors (e.g., duplicate registration number if unique index exists)
		h.logger.Error("Failed to create Menu Item in DB", zap.Error(err))
		// TODO: Check for specific DB errors like duplicate keys if needed
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusCreated).JSON(models.Response{Ok: true, Data: fiber.Map{"menuItemId": menuItemId}})
}

// HandleUpdaateMenuItemById updates an existing menu item by its ID.
func (h *Handler) HandleUpdaateMenuItemById(c fiber.Ctx) error {
	menuItemId := c.Params("menuItemId")
	if len(menuItemId) == 0 {
		return ErrInvalidMenuItemId
	}

	var req *models.MenuItemUpdate

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for update menu item", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Validate the request payload (using tags in models.MenuItemUpdate)
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for update Menu Item", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	// Pass the pointer to the update struct to the (assumed modified) repo function
	updatedMenuItem, err := h.db.UpdaateMenuItemById(c.RequestCtx(), menuItemId, req)

	if err != nil {
		fmt.Println(err)
		if apiErr, ok := errorMap[err]; ok {
			return apiErr // Handles ErrNoRes, ErrInvalidId from repo
		}
		h.logger.Error("Failed to update manu item", zap.String("restaurantId", menuItemId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedMenuItem})
}

// HandleUpdateMenuItemImageById updates the image URL of a menu item by its ID.
func (h *Handler) HandleUpdateMenuItemImageById(c fiber.Ctx) error {
	menuItemId := c.Params("menuItemId")
	if len(menuItemId) == 0 {
		return ErrInvalidMenuItemId
	}

	var req struct {
		ImgURL string `json:"image" validate:"required,url"`
	}

	if err := c.Bind().Body(&req); err != nil {
		h.logger.Warn("Failed to bind request body for image", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request body: "+err.Error())
	}
	if err := h.validate.Validate(req); err != nil {
		h.logger.Warn("Validation failed for update image", zap.Error(err))
		return fiber.NewError(fiber.StatusBadRequest, "Validation failed: "+err.Error())
	}

	updatedMenuItem, err := h.db.UpdateMenuItemImageById(c.RequestCtx(), menuItemId, req.ImgURL)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		h.logger.Error("Failed to update menu item cover", zap.String("menuItemId", menuItemId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return the updated restaurant document (as returned by the repo function)
	return c.Status(fiber.StatusOK).JSON(models.Response{Ok: true, Data: updatedMenuItem})
}

// HandleDeleteMenuItemById deletes a menu item from the database by its ID.
func (h *Handler) HandleDeleteMenuItemById(c fiber.Ctx) error {
	menuItemId := c.Params("menuItemId")
	if len(menuItemId) == 0 {
		return ErrInvalidMenuItemId
	}

	err := h.db.DeleteMenuItemById(c.RequestCtx(), menuItemId)
	if err != nil {
		if apiErr, ok := errorMap[err]; ok {
			return apiErr
		}
		// Log unexpected errors
		h.logger.Error("Failed to delete menu item", zap.String("menuItemId", menuItemId), zap.Error(err))
		return c.Status(fiber.StatusInternalServerError).JSON(InternalServerError)
	}

	// Return 204 No Content on successful deletion
	return c.SendStatus(fiber.StatusNoContent)
}
