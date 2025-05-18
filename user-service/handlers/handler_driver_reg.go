package handlers

import (
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/dto"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/middleware"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/app"
	"github.com/gofiber/fiber/v3"
)

// Driver for requests related to drivers.
type Driver struct{ app *app.App }

func NewApplication(app *app.App) *Driver {
	return &Driver{app: app}
}

// HandleGetAll gets all drivers
func (a *Driver) HandleGetAll(c fiber.Ctx) error {
	data, err := a.app.GetAllPendingDriverRegs(c.RequestCtx())
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(data))
}

// GetAllAppsByUser gets all driver applications made by the user (including rejected and withdrawn ones).
func (a *Driver) GetAllAppsByUser(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	data, err := a.app.GetAllRegByUserID(c.RequestCtx(), user.ID)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(data))
}

// GetUserAppCurrent gets the users current registration request
func (a *Driver) GetUserAppCurrent(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	data, err := a.app.GetCurrentRegByUserID(c.RequestCtx(), user.ID)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(data))
}

// WithdrawOwnApp handles the user withdrawing their own application
func (a *Driver) WithdrawOwnApp(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	err := a.app.WithdrawRegByID(c.RequestCtx(), user.ID)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok("Application withdrawn"))
}

func (a *Driver) CreateDriverApp(c fiber.Ctx) error {
	user := middleware.GetUser(c)
	if user == nil {
		return fiber.ErrUnauthorized
	}

	var data *createRequest
	if err := c.Bind().Body(&data); err != nil {
		return sendError(c, err)
	}

	appID, err := a.app.CreateDriverRegRequest(c.RequestCtx(), user.ID, data.ToRequest())
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusCreated).JSON(dto.NamedOk("applicationId", appID))
}
func (a *Driver) HandleGetByID(c fiber.Ctx) error {
	// Get application id from the request
	appID := c.Params("appId")
	if len(appID) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(dto.Error("invalid application id"))
	}

	reg, err := a.app.GetRegByID(c.RequestCtx(), appID)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(reg))
}

func (a *Driver) HandleApproveApp(c fiber.Ctx) error {
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
		return sendError(c, err)
	}

	err := a.app.UpdateReqApproveStatus(c.RequestCtx(), appID, user.ID, data.Approved, data.Reason)
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok("updated successfully"))
}

func (a *Driver) HandleGetAllDrivers(c fiber.Ctx) error {
	users, err := a.app.GetAllDrivers(c.RequestCtx())
	if err != nil {
		return sendError(c, err)
	}

	return c.Status(fiber.StatusOK).JSON(dto.Ok(users))
}
