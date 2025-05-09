package application

import "github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"

type createRequest struct {
	NIC           string `json:"nic_no" validate:"required,alphanum"`
	DriverLicense string `json:"driver_license" validate:"required"`
	VehicleNo     string `json:"vehicle_number" validate:"required"`

	VehicleType    models.VehicleType `json:"vehicle_type" validate:"required,oneof=bicycle three_wheel car"`
	VehiclePicture string             `json:"vehicle_image" validate:"required"`
}

type applicationApprove struct {
	Approved bool   `json:"approved"`
	Reason   string `json:"reason" validate:"omitempty,min=10,max=100"`
}

func (c *createRequest) ToRequest() *models.DriverRequest {
	return &models.DriverRequest{
		NIC:            c.NIC,
		DriverLicense:  c.DriverLicense,
		VehicleNo:      c.VehicleNo,
		VehiclePicture: c.VehiclePicture,
		VehicleType:    c.VehicleType,
		Status:         models.DriverRequestPending,
	}
}
