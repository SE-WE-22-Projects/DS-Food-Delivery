package validate

import (
	"reflect"
	"strings"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	en_translations "github.com/go-playground/validator/v10/translations/en"
)

type Validator struct {
	validator  *validator.Validate
	translator ut.Translator
}

func New() *Validator {
	validate := validator.New(
		validator.WithRequiredStructEnabled())

	// setup validation error message translation
	uni := ut.New(en.New())
	translator, _ := uni.GetTranslator("en")
	en_translations.RegisterDefaultTranslations(validate, translator)

	// extract tag name from struct so that the error message's field names match the json request's fields
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	return &Validator{validator: validate, translator: translator}
}

func (v *Validator) Validate(data any) error {
	err := v.validator.Struct(data)
	if err == nil {
		return nil
	}

	// unwrap the validation error and convert in to a ValidationErrors error
	if validateErr, ok := err.(validator.ValidationErrors); ok {
		newErr := &ValidationErrors{}
		for _, ve := range validateErr {
			newErr.errors = append(newErr.errors, fieldError{ve.Field(), ve.Translate(v.translator)})
		}

		return newErr
	}

	return err
}
