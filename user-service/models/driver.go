package models

import "time"

type VehicleType string

const (
	VehicleBicycle    VehicleType = "bicycle"
	VehicleThreeWheel VehicleType = "three_wheel"
	VehicleCar        VehicleType = "car"
)

type DriverStatus string

const (
	DriverUnavailable DriverStatus = "not_available"
	DriverAvailable   DriverStatus = "available"
	DriverBusy        DriverStatus = "busy"
)

type Driver struct {
	NIC           string `json:"nic_no" bson:"nic_no"`
	DriverLicense string `json:"driver_license" bson:"driver_license"`

	VehicleNo      string `json:"vehicle_number" bson:"vehicle_number"`
	VehicleType    string `json:"vehicle_type" bson:"vehicle_type"`
	VehiclePicture string `json:"vehicle_image" bson:"vehicle_image"`

	Status   DriverStatus `json:"status" bson:"status"`
	JoinedAt time.Time    `json:"joined_at" bson:"joined_at"`
}
