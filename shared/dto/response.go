package dto

// Response is the format for a successful response.
type Response struct {
	Ok   bool `json:"ok"`
	Data any  `json:"data"`
}

// Response is the format for a response that indicates that an error occurred while processing the request
type ErrorResponse struct {
	Ok     bool   `json:"ok"`
	Error  string `json:"error"`
	Reason any    `json:"reason,omitempty"`
}

// Ok creates a new [Response].
func Ok(data any) Response {
	return Response{Ok: true, Data: data}
}

// NamedOk creates a new [Response] with the data value set to a map containing the given (name, data) pair.
func NamedOk(name string, data any) Response {
	return Response{Ok: true, Data: map[string]any{name: data}}
}

// Error creates a new error response
func Error(err string, reason ...any) ErrorResponse {
	return ErrorResponse{Ok: false, Error: err, Reason: reason[0]}
}
