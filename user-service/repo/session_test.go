package repo

import (
	"context"
	"testing"
	"time"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/shared/database"
	"github.com/SE-WE-22-Projects/DS-Food-Delivery/user-service/models"
	"github.com/yehan2002/is/v2"
	"go.mongodb.org/mongo-driver/v2/bson"
)

var testSession = models.Session{
	UserID:     bson.NewObjectID(),
	Refresh:    "1234",
	CanRefresh: true,
	UA:         "abc browser",
	IP:         "127.0.0.1",
	CreatedAt:  time.Now(),
	ExpiresAt:  time.Now().Add(time.Hour)}

type sessionTest struct{}

func TestSessionRepo(t *testing.T) {
	is.Suite(t, &sessionTest{})
}

func (s *sessionTest) TestCreateSession(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	sessions := NewSessionRepo(db)

	sessionID, err := sessions.CreateSession(context.TODO(), &testSession)
	is.Ok(err, "session should be created")

	valid, err := sessions.IsValidSession(context.TODO(), testSession.UserID.Hex(), sessionID)
	is.Ok(err, "isValid should not return an error")

	is(valid, "session should be valid")

}

func (s *sessionTest) TestInvalidateSession(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	sessions := NewSessionRepo(db)

	sessionID, err := sessions.CreateSession(context.TODO(), &testSession)
	is.Ok(err, "session should be created")

	err = sessions.InvalidateSession(context.TODO(), testSession.UserID.Hex(), sessionID)
	is.Ok(err, "invalidate should be successful")

	valid, err := sessions.IsValidSession(context.TODO(), testSession.UserID.Hex(), sessionID)
	is.Ok(err, "isValid should not return an error")
	is(!valid, "session should not be valid")
}

func (s *sessionTest) TestInvalidateAllSessions(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	sessions := NewSessionRepo(db)

	sessionID, err := sessions.CreateSession(context.TODO(), &testSession)
	is.Ok(err, "session should be created")

	err = sessions.InvalidateSessions(context.TODO(), testSession.UserID.Hex())
	is.Ok(err, "invalidate should be successful")

	valid, err := sessions.IsValidSession(context.TODO(), testSession.UserID.Hex(), sessionID)
	is.Ok(err, "isValid should not return an error")
	is(!valid, "session should not be valid")
}

func (s *sessionTest) TestUseRefresh(is is.Is) {
	db, closer := database.ConnectTestDB()
	defer closer()

	sessions := NewSessionRepo(db)

	sessionID, err := sessions.CreateSession(context.TODO(), &testSession)
	is.Ok(err, "session should be created")

	validRefresh, err := sessions.UseSessionRefresh(context.TODO(), testSession.UserID.Hex(), sessionID, testSession.Refresh)
	is.Ok(err, "refresh should be successful")
	is(validRefresh, "refresh should valid")

	validRefresh, err = sessions.UseSessionRefresh(context.TODO(), testSession.UserID.Hex(), sessionID, testSession.Refresh)
	is.Ok(err, "refresh should not return an error")
	is(!validRefresh, "refresh should fail")

	valid, err := sessions.IsValidSession(context.TODO(), testSession.UserID.Hex(), sessionID)
	is.Ok(err, "isValid should not return an error")
	is(!valid, "session should not be valid")
}
