package repo

import (
	"context"
	"testing"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/yehan2002/is/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type driverTest struct{}

var driverApplicationData = models.DriverRequest{
	NIC:            "1234",
	DriverLicense:  "driver license",
	VehicleNo:      "abc 1234",
	VehicleType:    models.VehicleCar,
	VehiclePicture: "vehicle picture",
}

func TestDriverRepo(t *testing.T) {
	is.Suite(t, &driverTest{})
}

func (d *driverTest) makeUser(db *mongo.Database, isAdmin bool) bson.ObjectID { //nolint:all
	userRepo := NewUserRepo(db)
	userID, err := userRepo.CreateUser(context.TODO(), &models.User{
		Email: "test@abc.com",
		Name:  "test",
	})
	if err != nil {
		panic(err)
	}
	userObj, _ := bson.ObjectIDFromHex(userID)

	return userObj
}

func (d *driverTest) TestAddApplication(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	user := d.makeUser(db, false)
	repo := NewDriverRepo(db)
	data := driverApplicationData
	data.UserID = user

	reqID, err := repo.Create(context.TODO(), user.Hex(), &data)
	is.Equal(err, nil, "application should be created successfully")

	application, err := repo.GetByID(context.TODO(), reqID)
	is.Equal(err, nil, "application should be fetched successfully")

	is.Equal(application.DriverLicense, data.DriverLicense, "incorrect value set")
	is.Equal(application.NIC, data.NIC, "incorrect value set")
	is.Equal(application.VehicleNo, data.VehicleNo, "incorrect value set")
	is.Equal(application.VehicleType, data.VehicleType, "incorrect value set")
	is.Equal(application.Status, models.DriverRequestPending, "incorrect value set")
}

func (d *driverTest) TestApplicationWithdraw(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	user := d.makeUser(db, false)
	repo := NewDriverRepo(db)
	data := driverApplicationData
	data.UserID = user

	reqID, err := repo.Create(context.TODO(), user.Hex(), &data)
	is.Equal(err, nil, "application should be created successfully")

	err = repo.WithdrawApplication(context.TODO(), user.Hex())
	is.Equal(err, nil, "application should be withdrawn successfully")

	application, err := repo.GetByID(context.TODO(), reqID)
	is.Equal(err, nil, "application should be fetched successfully")
	is.Equal(application.Status, models.DriverRequestWithdrawn, "application should be withdrawn")
}

func (d *driverTest) TestApplicationReject(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	user := d.makeUser(db, false)
	admin := d.makeUser(db, true)
	repo := NewDriverRepo(db)
	data := driverApplicationData
	data.UserID = user

	reqID, err := repo.Create(context.TODO(), user.Hex(), &data)
	is.Equal(err, nil, "application should be created successfully")

	err = repo.DenyApplication(context.TODO(), reqID, admin.Hex(), "denied")
	is.Equal(err, nil, "application should be denied successfully")

	application, err := repo.GetByID(context.TODO(), reqID)
	is.Equal(err, nil, "application should be fetched successfully")
	is.Equal(application.Status, models.DriverRequestRejected, "application should be denied")
}

func (d *driverTest) TestApplicationAccept(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	user := d.makeUser(db, false)
	admin := d.makeUser(db, true)
	repo := NewDriverRepo(db)
	data := driverApplicationData
	data.UserID = user

	reqID, err := repo.Create(context.TODO(), user.Hex(), &data)
	is.Equal(err, nil, "application should be created successfully")

	err = repo.AcceptApplication(context.TODO(), reqID, admin.Hex())
	is.Equal(err, nil, "application should be accepted successfully")

	application, err := repo.GetByID(context.TODO(), reqID)
	is.Equal(err, nil, "application should be fetched successfully")
	is.Equal(application.Status, models.DriverRequestAccepted, "application should be accepted")
}
