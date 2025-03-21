package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v3"
)

// unmarshalJsonStrict unmarshals the given json data.
// This is a wrapper around the standard library json package with improved error handling
func unmarshalJsonStrict(data []byte, v any) error {
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.DisallowUnknownFields()
	err := decoder.Decode(v)
	if err != nil {

		// handle syntax error in json
		var syntaxError *json.SyntaxError
		if errors.As(err, &syntaxError) {
			msg := fmt.Sprintf("Request JSON has a syntax error (at position %d)", syntaxError.Offset)
			return fiber.NewError(fiber.StatusBadRequest, msg)
		}

		// handle incorrect type in json
		var unmarshalTypeError *json.UnmarshalTypeError
		if errors.As(err, &unmarshalTypeError) {
			msg := fmt.Sprintf("Incorrect data type for field %q (at position %d) expected %s", unmarshalTypeError.Field, unmarshalTypeError.Offset, unmarshalTypeError.Type.Name())
			return fiber.NewError(fiber.StatusBadRequest, msg)
		}

		// handle extra values
		if strings.HasPrefix(err.Error(), "json: unknown field ") {
			fieldName := strings.TrimPrefix(err.Error(), "json: unknown field ")
			msg := fmt.Sprintf("Request body contains  field %s", fieldName)
			return fiber.NewError(fiber.StatusBadRequest, msg)
		}
	}
	return err
}
