package repo

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ErrNoApplication indicates that the application with the given id does not exist in the database
var ErrNoApplication = errors.New("application with the given id was not found")
var ErrApplicationNotPending = errors.New("driver application has already been handled")
var ErrUserIsDriver = errors.New("user is already a driver")

type DriverApplicationRepo interface {
	// GetAllPenGetAllByStatus returns all applications
	GetAllByStatus(ctx context.Context, status models.DriverRequestStatus) ([]*models.DriverRequest, error)
	// GetAllByUser gets all applications made by the user
	GetAllByUser(ctx context.Context, userID string) ([]*models.DriverRequest, error)
	// GetActiveByUserId gets the current active application for the user
	GetActiveByUser(ctx context.Context, userID string) (*models.DriverRequest, error)
	// GetByID returns the driver application with the given id.
	// Returns [ErrNoApplication] if the application with the given id does not exist.
	GetByID(ctx context.Context, id string) (*models.DriverRequest, error)
	// Create creates a new driver application
	Create(ctx context.Context, userID string, data *models.DriverRequest) (string, error)
	// DenyApplication denies a driver application for the the given reason
	DenyApplication(ctx context.Context, id string, denierID string, denyReason string) error
	// AcceptApplication accepts a application
	AcceptApplication(ctx context.Context, id string, approverID string) error
	// WithdrawApplication withdraws an application
	WithdrawApplication(ctx context.Context, userID string) error
}

type driverRepo struct {
	client       *mongo.Client
	users        *mongo.Collection
	applications *mongo.Collection
}

func (d *driverRepo) GetAllByStatus(ctx context.Context, status models.DriverRequestStatus) ([]*models.DriverRequest, error) {
	cursor, err := d.applications.Find(ctx, bson.D{{Key: "status", Value: status}})
	if err != nil {
		return nil, err
	}

	var application []*models.DriverRequest
	err = cursor.All(ctx, &application)
	if err != nil {
		return nil, err
	}

	if len(application) == 0 {
		return []*models.DriverRequest{}, nil
	}

	return application, nil
}

func (d *driverRepo) GetAllByUser(ctx context.Context, strUserID string) ([]*models.DriverRequest, error) {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return nil, ErrInvalidID
	}

	cursor, err := d.applications.Find(ctx, bson.D{{Key: "user_id", Value: userID}})
	if err != nil {
		return nil, err
	}

	var application []*models.DriverRequest
	err = cursor.All(ctx, &application)
	if err != nil {
		return nil, err
	}

	if len(application) == 0 {
		return []*models.DriverRequest{}, nil
	}

	return application, nil
}

// GetByID returns the driver application with the given id.
// Returns [ErrNoApplication] if the application with the given id does not exist.
func (d *driverRepo) GetByID(ctx context.Context, id string) (*models.DriverRequest, error) {
	reqID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidID
	}

	result := d.applications.FindOne(ctx, bson.D{{Key: "_id", Value: reqID}})
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNoApplication
		}
		return nil, err
	}

	var application models.DriverRequest
	if err := result.Decode(&application); err != nil {
		return nil, err
	}

	return &application, nil
}

// GetActiveByUser gets the current active application for the user
// Returns [ErrNoApplication] if the application with the given id does not exist.
func (d *driverRepo) GetActiveByUser(ctx context.Context, strUserID string) (*models.DriverRequest, error) {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return nil, ErrInvalidID
	}

	result := d.applications.FindOne(ctx, bson.D{{Key: "user_id", Value: userID}, {Key: "status", Value: models.DriverRequestPending}})
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNoApplication
		}
		return nil, err
	}

	var application models.DriverRequest
	if err := result.Decode(&application); err != nil {
		return nil, err
	}

	return &application, nil
}

func (d *driverRepo) WithdrawApplication(ctx context.Context, strUserID string) error {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return ErrInvalidID
	}

	_, err = d.applications.UpdateOne(ctx, bson.D{
		{Key: "user_id", Value: userID},
		{Key: "status", Value: models.DriverRequestPending}}, bson.D{
		{Key: "$set", Value: bson.D{{Key: "status", Value: string(models.DriverRequestWithdrawn)}}},
		{Key: "$currentDate", Value: bson.D{{Key: "updated_at", Value: true}}},
	})
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return ErrNoApplication
		}
		return err
	}

	return nil
}

func (d *driverRepo) AcceptApplication(ctx context.Context, id string, strApproverID string) error {
	return d.changeApplicationStatus(ctx, id, models.DriverRequestAccepted, strApproverID, "")
}

func (d *driverRepo) DenyApplication(ctx context.Context, id string, denierID string, denyReason string) error {
	return d.changeApplicationStatus(ctx, id, models.DriverRequestRejected, denierID, denyReason)
}

// ChangeApplicationStatus changes the status of the driver application with the given id.
// changer is the id of the user who is changing the state of the application.
func (d *driverRepo) changeApplicationStatus(ctx context.Context, id string, newStatus models.DriverRequestStatus, strChangerID string, reason string) error {
	reqID, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return ErrInvalidID
	}

	userID, err := bson.ObjectIDFromHex(strChangerID)
	if err != nil {
		return ErrInvalidID
	}

	session, err := d.client.StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)

	_, err = session.WithTransaction(ctx, func(ctx context.Context) (any, error) {

		// check if the admin user id is valid
		changer, err := findUser(ctx, d.users, bson.E{Key: "_id", Value: userID})
		if err != nil {
			return nil, err
		}

		// get the application from the database
		result := d.applications.FindOne(ctx, bson.D{{Key: "_id", Value: reqID}})
		if result.Err() != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return nil, ErrNoApplication
			}
			return nil, result.Err()
		}

		// read the application data from the result
		var application models.DriverRequest
		if err = result.Decode(&application); err != nil {
			return nil, err
		}

		// only allow editing pending applications
		if application.Status != models.DriverRequestPending {
			return nil, ErrApplicationNotPending
		}

		switch newStatus {
		case models.DriverRequestWithdrawn:
			if application.UserID != userID {
				return nil, fmt.Errorf("no permission")
			}
		case models.DriverRequestAccepted, models.DriverRequestRejected:
			// TODO: permission check
			_ = changer
		}

		// update the status of the result
		result = d.applications.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: reqID}},
			bson.D{
				{Key: "$set", Value: bson.D{
					{Key: "status", Value: string(newStatus)},
					{Key: "handled_by", Value: userID},
					{Key: "remark", Value: reason},
				}},
				{Key: "$currentDate", Value: bson.D{{Key: "updated_at", Value: true}}},
			}, options.FindOneAndUpdate().SetReturnDocument(options.After))
		if result.Err() != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return nil, ErrNoApplication
			}
			return nil, result.Err()
		}

		// update the user profile if the application was accepted
		if newStatus == models.DriverRequestAccepted {
			driver, err := findUser(ctx, d.users, bson.E{Key: "_id", Value: application.UserID})
			if err != nil {
				return nil, err
			}

			// check if the user is already registered as a driver
			if driver.DriverProfile != nil {
				return nil, ErrUserIsDriver
			}

			driverDetails := models.Driver{
				NIC:            application.NIC,
				DriverLicense:  application.DriverLicense,
				VehicleNo:      application.VehicleNo,
				VehiclePicture: application.VehiclePicture,
				VehicleType:    application.VehicleType,
				Status:         models.DriverUnavailable,
				JoinedAt:       time.Now(),
			}

			_, err = updateUserByID(ctx, d.users, application.UserID.Hex(),
				bson.E{Key: "$set", Value: bson.D{{Key: "driver_profile", Value: driverDetails}}})
			if err != nil {
				return nil, err
			}

			_, err = updateUserByID(ctx, d.users, application.UserID.Hex(), bson.E{Key: "$addToSet", Value: bson.D{{Key: "roles", Value: "role_driver"}}})
			if err != nil {
				return nil, err
			}

		}

		return nil, nil
	})

	return err
}

// Create implements DriverRepo.
func (d *driverRepo) Create(ctx context.Context, strUserID string, data *models.DriverRequest) (string, error) {
	userID, err := bson.ObjectIDFromHex(strUserID)
	if err != nil {
		return "", ErrInvalidID
	}

	session, err := d.client.StartSession()
	if err != nil {
		return "", err
	}
	defer session.EndSession(ctx)

	// ignore status data
	data.Status = models.DriverRequestPending
	data.HandledBy = nil
	data.Remark = ""
	data.UserID = userID

	reqID, err := session.WithTransaction(ctx, func(ctx context.Context) (any, error) {
		// check if the user id is valid
		user, err := findUser(ctx, d.users, bson.E{Key: "_id", Value: userID})
		if err != nil {
			return nil, err
		}

		// check if the user is already registered as a driver
		if user.DriverProfile != nil {
			return nil, ErrUserIsDriver
		}

		// create the application
		result, err := d.applications.InsertOne(ctx, data)
		if err != nil {
			return nil, err
		}

		if reqID, ok := result.InsertedID.(bson.ObjectID); ok {
			return reqID.Hex(), nil
		}

		return nil, fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)
	})

	if err != nil {
		return "", err
	}

	return reqID.(string), nil
}

func NewDriverRepo(con *mongo.Database) DriverApplicationRepo {
	return &driverRepo{
		client:       con.Client(),
		users:        con.Collection("user"),
		applications: con.Collection("driver-applications"),
	}
}
