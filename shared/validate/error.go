package validate

// fieldError is a single validation error.
type fieldError struct {
	Field string `json:"field"`
	Error string `json:"error"`
}

// ValidationErrors is an error that contains a list of validation errors
type ValidationErrors struct {
	errors []fieldError
}

func (v *ValidationErrors) Error() string         { return "request body validation failed" }
func (v *ValidationErrors) ValidationErrors() any { return v.errors }
