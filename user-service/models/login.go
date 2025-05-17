package models

type LoginRequest struct {
	Email    string
	Password string
	IP       string
	UA       string
}

type LoginResponse struct {
	User    *User  `json:"user"`
	Token   string `json:"token"`
	Refresh string `json:"refresh"`
}
