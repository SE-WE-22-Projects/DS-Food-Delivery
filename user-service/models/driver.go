package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type VehicleType string

const (
	VehicleMotorbike  VehicleType = "motorbike"
	VehicleThreeWheel VehicleType = "three_wheel"
	VehicleCar        VehicleType = "car"
)

type DriverStatus string

const (
	DriverUnavailable DriverStatus = "not_available"
	DriverAvailable   DriverStatus = "available"
	DriverBusy        DriverStatus = "busy"
)

type DriverRequestStatus string

const (
	DriverRequestPending   DriverRequestStatus = "pending"
	DriverRequestAccepted  DriverRequestStatus = "accepted"
	DriverRequestRejected  DriverRequestStatus = "rejected"
	DriverRequestWithdrawn DriverRequestStatus = "withdrawn"
)

type Driver struct {
	NIC           string `json:"nic_no" bson:"nic_no"`
	DriverLicense string `json:"driver_license" bson:"driver_license"`

	VehicleNo      string      `json:"vehicle_number" bson:"vehicle_number"`
	VehicleType    VehicleType `json:"vehicle_type" bson:"vehicle_type"`
	VehiclePicture string      `json:"vehicle_image" bson:"vehicle_image"`

	Status   DriverStatus `json:"status" bson:"status"`
	JoinedAt time.Time    `json:"joined_at" bson:"joined_at"`
}

// DriverRequest is a application filled by a user to be a driver.
// It can be accepted or rejected by an admin.
// If it is accepted, this data will be copied to [User.Driver] of the user.
type DriverRequest struct {
	ID            bson.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID        bson.ObjectID `json:"user_id" bson:"user_id"`
	NIC           string        `json:"nic_no" bson:"nic_no"`
	DriverLicense string        `json:"driver_license" bson:"driver_license"`

	VehicleNo      string      `json:"vehicle_number" bson:"vehicle_number"`
	VehicleType    VehicleType `json:"vehicle_type" bson:"vehicle_type"`
	VehiclePicture string      `json:"vehicle_image" bson:"vehicle_image"`

	Status DriverRequestStatus `json:"status" bson:"status"`
	Remark string              `json:"admin_remark,omitempty" bson:"remark"`

	HandledBy *bson.ObjectID `json:"handled_by" bson:"handled_by"`
	CreatedAt time.Time      `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time      `json:"updated_at" bson:"updated_at"`
}

func (u *DriverRequest) MarshalBSON() ([]byte, error) {
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
	}
	u.UpdatedAt = time.Now()

	type t DriverRequest
	return bson.Marshal((*t)(u))
}
