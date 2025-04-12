package application

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/validate"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/repo"
	"github.com/gofiber/fiber/v3"
)

// Handler for requests related to driver registration application forms.
type Handler struct {
	db       repo.DriverApplicationRepo
	validate *validate.Validator
}

func NewHandler(db repo.DriverApplicationRepo) *Handler {
	return &Handler{db: db}
}

type createRequest struct {
	NIC           string `json:"nic_no" validate:"required,alphanum"`
	DriverLicense string `json:"driver_license" validate:"required"`
	VehicleNo     string `json:"vehicle_number" validate:"required"`

	VehicleType    models.VehicleType `json:"vehicle_type" validate:"required,oneof=bicycle three_wheel car"`
	VehiclePicture string             `json:"vehicle_image" validate:"required"`
}

func (h *Handler) HandleGetAll(c fiber.Ctx) error {
	data, err := h.db.GetAllPending(c.RequestCtx())
	if err != nil {
		return err
	}

	return c.Status(200).JSON(models.Response{Ok: true, Data: data})
}

// HandleGetAllByUser gets all driver applications made by the user (including rejected and withdrawn ones).
func (h *Handler) HandleGetAllByUser(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	data, err := h.db.GetAllByUser(c.RequestCtx(), user.ID)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(models.Response{Ok: true, Data: data})
}

func (h *Handler) HandleGetUserCurrent(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	data, err := h.db.GetActiveByUser(c.RequestCtx(), user.ID)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(models.Response{Ok: true, Data: data})
}

func (h *Handler) HandleUserWithdraw(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	err := h.db.WithdrawApplication(c.RequestCtx(), user.ID)
	if err != nil {
		return err
	}

	return c.Status(200).JSON(models.Response{Ok: true, Data: "Application withdrawn"})
}

func (h *Handler) HandleCreate(c fiber.Ctx) error {
	var data *createRequest
	err := c.Bind().Body(&data)
	if err != nil {
		return err
	}

	// validate the request
	err = h.validate.Validate(data)
	if err != nil {
		return err
	}

	// TODO: additional validation for nic,license,vehicle no

	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	appId, err := h.db.Create(c.RequestCtx(), user.ID, &models.DriverRequest{
		NIC:            data.NIC,
		DriverLicense:  data.DriverLicense,
		VehicleNo:      data.VehicleNo,
		VehiclePicture: data.VehiclePicture,
		VehicleType:    data.VehicleType,
	})
	if err != nil {
		return err
	}

	return c.Status(201).JSON(models.Response{Ok: true, Data: fiber.Map{"applicationId": appId}})
}

type applicationApprove struct {
	Approved bool   `json:"approved"`
	Reason   string `json:"reason" validate:"max=100"`
}

func (h *Handler) HandleApprove(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	// Get application id from the request
	appId := c.Params("appId")
	if len(appId) == 0 {
		return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "invalid application id"})
	}

	var data *applicationApprove
	err := c.Bind().Body(&data)
	if err != nil {
		return err
	}

	// validate the request
	err = h.validate.Validate(data)
	if err != nil {
		return err
	}

	if data.Approved {
		err = h.db.AcceptApplication(c.RequestCtx(), appId, user.ID)
		if err != nil {
			return err
		}

		return c.Status(200).JSON(models.Response{Ok: true, Data: "approved successfully"})
	} else {
		if len(data.Reason) < 10 {
			return c.Status(400).JSON(models.ErrorResponse{Ok: false, Error: "rejection reason must be at least 10 characters"})
		}

		err = h.db.DenyApplication(c.RequestCtx(), appId, user.ID, data.Reason)
		if err != nil {
			return err
		}

		return c.Status(200).JSON(models.Response{Ok: true, Data: "denied successfully"})
	}
}
