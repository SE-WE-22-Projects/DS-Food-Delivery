package app

import (
	"context"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
)

// CreateDriverRegRequest creates a driver registration request.
func (a *App) CreateDriverRegRequest(ctx context.Context, userID string, data *models.DriverRequest) (string, error) {
	return a.driverReg.Create(ctx, userID, data)
}

// GetAllPendingDriverRegs returns a list of all pending driver registrations
func (a *App) GetAllPendingDriverRegs(ctx context.Context) ([]*models.DriverRequest, error) {
	return a.driverReg.GetAllByStatus(ctx, models.DriverRequestPending)
}

// GetAllApprovedDriverRegs returns a list of all pending driver registrations
func (a *App) GetAllApprovedDriverRegs(ctx context.Context) ([]*models.DriverRequest, error) {
	return a.driverReg.GetAllByStatus(ctx, models.DriverRequestAccepted)
}

// GetAllRejectedDriverRegs returns a list of all pending driver registrations
func (a *App) GetAllRejectedDriverRegs(ctx context.Context) ([]*models.DriverRequest, error) {
	return a.driverReg.GetAllByStatus(ctx, models.DriverRequestRejected)
}

func (a *App) GetRegByID(ctx context.Context, regID string) (*models.DriverRequest, error) {
	return a.driverReg.GetByID(ctx, regID)
}

// GetCurrentRegByUserID gets the current registration request by user id.
// If the user does not have an active registration request, returns [repo.ErrNoApplication]
func (a *App) GetCurrentRegByUserID(ctx context.Context, userID string) (*models.DriverRequest, error) {
	return a.driverReg.GetActiveByUser(ctx, userID)
}

// GetAllRegByUserID gets all registration requests made by the user.
func (a *App) GetAllRegByUserID(ctx context.Context, userID string) ([]*models.DriverRequest, error) {
	return a.driverReg.GetAllByUser(ctx, userID)
}

// WithdrawRegByID withdraws the driver registration request for the given user id.
func (a *App) WithdrawRegByID(ctx context.Context, userID string) error {
	return a.driverReg.WithdrawApplication(ctx, userID)
}

// UpdateReqApproveStatus updates the approval status of the registration request with the given id.
func (a *App) UpdateReqApproveStatus(ctx context.Context, regID string, approverID string, approved bool, denyReason string) error {
	if approved {
		return a.driverReg.AcceptApplication(ctx, regID, approverID)
	}

	return a.driverReg.DenyApplication(ctx, regID, approverID, denyReason)
}
