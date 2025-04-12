package database

import (
	"context"
	"crypto/rand"
	"fmt"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

// TestDBPort is the port that the test database is running on.
var TestDBPort = 27017

// ConnectTestDB connects to a local test database.
// Mongo should be running on the local machine at [TestDBPort].
// This creates a temporary database with a random name that exists until the [closer] function is called.
func ConnectTestDB() (database *mongo.Database, closer func()) {
	con, err := ConnectMongo(context.Background(), MongoConfig{URL: fmt.Sprintf("mongodb://127.0.0.1:%d/", TestDBPort)})
	if err != nil {
		panic(err)
	}

	// create a test database with a random name
	database = con.Database("test-db-" + rand.Text())

	// function to delete the database and close the connection
	closer = func() {
		if err := database.Drop(context.Background()); err != nil {
			panic(err)
		}
		if err := con.Disconnect(context.Background()); err != nil {
			panic(err)
		}
	}

	return
}
