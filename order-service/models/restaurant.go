package models

type Restaurant struct {
	Id       string `json:"id" bson:"id"`
	Name     string `json:"name" bson:"name"`
	Location Point  `json:"location" bson:"location"`
}
