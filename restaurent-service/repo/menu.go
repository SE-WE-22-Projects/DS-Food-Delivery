package repo

import (
	"context"
	"errors"
	"fmt"

	"github.com/SE-WE-22-Projects/DS-Food-Delivery/restaurent-service/models"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var ErrNoMenu = errors.New("restaurent not found")

type MenuItemRepo interface {
	// GetAllMenuItems retrieves all menu items from the database.
	GetAllMenuItems(ctx context.Context) ([]models.MenuItem, error)
	// GetResturanMenuItems retrieves all menu items for a specific restaurant by its ID.
	GetResturanMenuItems(ctx context.Context, resturantId string) ([]models.MenuItem, error)
	// GetMenuItemById retrieves a menu item by its unique ID.
	GetMenuItemById(ctx context.Context, id string) (*models.MenuItem, error)
	// CreateMenuItem creates a new menu item and returns the ID of the created item.
	CreateMenuItem(ctx context.Context, menuItem *models.MenuItem) (string, error)
	// UpdaateMenuItemById updates an existing menu item by its ID and returns the updated item.
	UpdaateMenuItemById(ctx context.Context, id string, update *models.MenuItemUpdate) (*models.MenuItem, error)
	// UpdateMenuItemImageById updates the image of a menu item identified by its ID.
	UpdateMenuItemImageById(ctx context.Context, id string, image string) (*models.MenuItem, error)
	// DeleteMenuItemById deletes a menu item identified by its ID.
	DeleteMenuItemById(ctx context.Context, id string) error
}

type menuItemRepo struct {
	collection *mongo.Collection
}

// CreateMenuItem implements MenuItemRepo.
func (m *menuItemRepo) CreateMenuItem(ctx context.Context, menuItem *models.MenuItem) (string, error) {
	menuItem.Id = bson.NilObjectID
	result, err := m.collection.InsertOne(ctx, menuItem)

	if err != nil {
		return "", err
	}

	if objId, ok := result.InsertedID.(bson.ObjectID); ok {
		return objId.Hex(), nil
	}

	return "", fmt.Errorf("mongo InsertOne result InsertedId is not a ObjectID got %v", result.InsertedID)
}

// DeleteMenuItemById implements MenuItemRepo.
func (m *menuItemRepo) DeleteMenuItemById(ctx context.Context, id string) error {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return ErrInvalidId
	}

	// Perform the update to set the 'deleted_at' field to the current timestamp
	_, err = m.collection.UpdateOne(
		ctx,
		bson.D{{Key: "_id", Value: objId}},
		bson.D{{Key: "$currentDate", Value: bson.D{{Key: "deleted_at", Value: true}}}},
	)

	// Return any error encountered
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return ErrNoRes
		}
		return err
	}

	return nil
}

// GetAllMenuItems implements MenuItemRepo.
func (m *menuItemRepo) GetAllMenuItems(ctx context.Context) ([]models.MenuItem, error) {
	cursor, err := m.collection.Find(ctx, bson.D{{Key: "deleted_at", Value: nil}})
	if err != nil {
		return nil, err
	}

	var menuItems []models.MenuItem
	err = cursor.All(ctx, &menuItems)
	if err != nil {
		return nil, err
	}

	if len(menuItems) == 0 {
		return []models.MenuItem{}, nil
	}

	return menuItems, nil
}

// GetMenuItemById implements MenuItemRepo.
func (m *menuItemRepo) GetMenuItemById(ctx context.Context, id string) (*models.MenuItem, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}
	// Query the menu item by its ObjectID
	var menuItem models.MenuItem
	err = m.collection.FindOne(ctx, bson.D{{Key: "_id", Value: objId}, {Key: "deleted_at", Value: nil}}).Decode(&menuItem)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoMenu
		}
		return nil, err
	}

	return &menuItem, nil
}

// GetResturanMenuItems implements MenuItemRepo.
func (m *menuItemRepo) GetResturanMenuItems(ctx context.Context, resturantId string) ([]models.MenuItem, error) {
	// Parse the ID into a valid ObjectID
	resObjId, err := bson.ObjectIDFromHex(resturantId)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Query the menu item by restaurent
	cursor, err := m.collection.Find(ctx, bson.D{{Key: "restaurent_id", Value: resObjId}, {Key: "deleted_at", Value: nil}})
	if err != nil {
		return nil, err
	}

	var menuItems []models.MenuItem
	err = cursor.All(ctx, &menuItems)
	if err != nil {
		return nil, err
	}

	if len(menuItems) == 0 {
		return []models.MenuItem{}, nil
	}

	return menuItems, nil
}

// UpdaateMenuItemById implements MenuItemRepo.
func (m *menuItemRepo) UpdaateMenuItemById(ctx context.Context, id string, update *models.MenuItemUpdate) (*models.MenuItem, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	result := m.collection.FindOneAndUpdate(
		ctx,
		// Filter: Check if the menu item exists and is not deleted
		bson.D{{Key: "_id", Value: objId}, {Key: "deleted_at", Value: nil}},
		// Update: Apply the update and set the current timestamp for the 'updated_at' field
		bson.D{bson.E{Key: "$set", Value: update}, {Key: "$currentDate", Value: bson.D{{Key: "updated_at", Value: true}}}},
		// Return the updated document (After operation)
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	// Check for errors in the update operation
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNoRes
		}
		return nil, err
	}

	// Decode the updated menu item document
	var menuItem models.MenuItem
	if err := result.Decode(&menuItem); err != nil {
		return nil, err
	}

	return &menuItem, nil
}

// UpdateMenuItemImageById implements MenuItemRepo.
func (m *menuItemRepo) UpdateMenuItemImageById(ctx context.Context, id string, image string) (*models.MenuItem, error) {
	// Parse the ID into a valid ObjectID
	objId, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Perform the update to set the image
	update := bson.D{
		{Key: "$set", Value: bson.D{{Key: "image", Value: image}}},
	}

	// Update the document in the collection
	var menuItem models.MenuItem
	err = m.collection.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: objId}}, update).Decode(&menuItem)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, ErrNoRes
		}
		return nil, err
	}

	return nil, err
}

func NewMenItemRepo(con *mongo.Database) MenuItemRepo {
	return &menuItemRepo{collection: con.Collection("menu_items")}
}
