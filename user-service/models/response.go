package models

// Response is the format for a successful response.
type Response struct {
	Ok   bool `json:"ok"`
	Data any  `json:"data"`
}

// Response is the format for a response that indicates that an error occurred while processing the request
type ErrorResponse struct {
	Ok     bool   `json:"ok"`
	Error  string `json:"data"`
	Reason any    `json:"reason,omitempty"`
}
