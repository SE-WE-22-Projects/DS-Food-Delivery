package application

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
)

// Handler for requests related to driver registration application forms.
type Handler struct {
	db       repo.DriverApplicationRepo
	validate *validate.Validator
}

func NewHandler(db repo.DriverApplicationRepo) *Handler {
	return &Handler{db: db, validate: validate.New()}
}

func (h *Handler) HandleGetAll(c fiber.Ctx) error {
	data, err := h.db.GetAllPending(c.RequestCtx())
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(data))
}

// GetAllByUser gets all driver applications made by the user (including rejected and withdrawn ones).
func (h *Handler) GetAllByUser(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	data, err := h.db.GetAllByUser(c.RequestCtx(), user.ID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(data))
}

func (h *Handler) GetUserCurrent(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	data, err := h.db.GetActiveByUser(c.RequestCtx(), user.ID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(data))
}

// WithdrawOwn handles the user withdrawing their own application
func (h *Handler) WithdrawOwn(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	err := h.db.WithdrawApplication(c.RequestCtx(), user.ID)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok("Application withdrawn"))
}

func (h *Handler) Create(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	var data *createRequest
	if err := c.Bind().Body(&data); err != nil {
		return err
	}

	appID, err := h.db.Create(c.RequestCtx(), user.ID, data.ToRequest())
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusCreated).JSON(dto.NamedOk("applicationId", appID))
}

func (h *Handler) HandleApprove(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	// Get application id from the request
	appID := c.Params("appId")
	if len(appID) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(dto.Error("invalid application id"))
	}

	var data *applicationApprove
	if err := c.Bind().Body(&data); err != nil {
		return err
	}

	if data.Approved {
		err := h.db.AcceptApplication(c.RequestCtx(), appID, user.ID)
		if err != nil {
			return err
		}

		return c.Status(fiber.StatusOK).JSON(dto.Ok("approved successfully"))
	}

	err := h.db.DenyApplication(c.RequestCtx(), appID, user.ID, data.Reason)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok("denied successfully"))
}
