package repo

import (
	"context"
	"testing"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/yehan2002/is/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type userTests struct{}

func TestUserRepo(t *testing.T) {
	is.Suite(t, &userTests{})
}

func (u *userTests) TestCreateUser(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	repo := NewUserRepo(db)

	userID, err := repo.CreateUser(context.TODO(), &models.User{
		Email: "test@abc.com",
		Name:  "test",
	})
	is(err == nil, "user should be created successfully")

	user, err := repo.GetUserByID(context.TODO(), userID)
	is(err == nil, "get user should succeed")
	is.Equal(user.Name, "test", "user name should be set")
	is(!user.CreatedAt.IsZero(), "created_at should  be set")
	is(!user.UpdatedAt.IsZero(), "updated_at should  be set")
}

func (u *userTests) TestGetInvalidUser(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	repo := NewUserRepo(db)

	user, err := repo.GetUserByID(context.TODO(), "invalid-id")
	is(user == nil, "user should be nil")
	is.Err(err, ErrInvalidID, "error should be invalid id")

	user, err = repo.GetUserByID(context.TODO(), bson.NewObjectID().Hex())
	is(user == nil, "user should be nil")
	is.Err(err, ErrNoUser, "error should be ErrNoUser")
}

func (u *userTests) TestGetAllUser(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	repo := NewUserRepo(db)

	_, err := repo.CreateUser(context.TODO(), &models.User{
		Email: "test@abc.com",
		Name:  "test",
	})
	is(err == nil, "user should be created successfully")

	_, err = repo.CreateUser(context.TODO(), &models.User{
		Email: "test2@abc.com",
		Name:  "test2",
	})
	is(err == nil, "user should be created successfully")

	users, err := repo.GetAllUsers(context.TODO())
	is(err == nil, "GetAllUsers should be successful")
	is(len(users) == 2, "two users should be returned")
}

func (u *userTests) TestGetUserByEmail(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	repo := NewUserRepo(db)

	userID, err := repo.CreateUser(context.TODO(), &models.User{
		Email: "test@abc.com",
		Name:  "test",
	})
	is(err == nil, "user should be created successfully")

	user, err := repo.FindUserByEmail(context.TODO(), "test@abc.com")
	is(err == nil, "find user should be successful")
	is(userID == user.ID.Hex(), "correct user should be returned")
}

func (u *userTests) TestUserUpdate(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	repo := NewUserRepo(db)

	userID, err := repo.CreateUser(context.TODO(), &models.User{
		Email: "test@abc.com",
		Name:  "test",
	})
	is(err == nil, "user should be created successfully")

	data := &models.UserUpdate{
		Name:     "test 2",
		MobileNo: "1111111111111",
		Email:    "new@test.com",
		Address:  models.Address{No: "1"},
	}

	updated, err := repo.UpdateUserByID(context.TODO(), userID, data)
	is(err == nil, "update should be successful")
	is.Equal(updated.Name, data.Name, "updated value is incorrect")
	is.Equal(updated.MobileNo, data.MobileNo, "updated value is incorrect")
	is.Equal(updated.Email, data.Email, "updated value is incorrect")
	is.Equal(updated.Address, data.Address, "updated value is incorrect")
	// TODO: check if the verified state of email resets.
}

func (u *userTests) TestUserPropertyUpdate(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	repo := NewUserRepo(db)
	userID, err := repo.CreateUser(context.TODO(), &models.User{
		Email: "test@abc.com",
		Name:  "test",
	})
	is(err == nil, "user should be created successfully")

	updated, err := repo.UpdateUserImage(context.TODO(), userID, "new image")
	is(err == nil, "update should be successful")
	is.Equal(updated.ProfileImage, "new image", "updated value is incorrect")

	err = repo.UpdateUserPassword(context.TODO(), userID, []byte("new passwd"))
	is(err == nil, "update should be successful")
	updated, err = repo.GetUserByID(context.TODO(), userID)
	is(err == nil, "get should be successful")
	is.Equal(updated.Password, "new passwd", "updated value is incorrect")
}

func (u *userTests) TestDeleteUser(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	repo := NewUserRepo(db)
	userID, err := repo.CreateUser(context.TODO(), &models.User{
		Email: "test@abc.com",
		Name:  "test",
	})
	is(err == nil, "user should be created successfully")

	err = repo.DeleteUserByID(context.TODO(), userID)
	is(err == nil, "user should be deleted successfully")
	_, err = repo.GetUserByID(context.TODO(), userID)
	is.Err(err, ErrNoUser, "user should not exist")

}
