package config

import (
	"errors"
	"os"
)

// LoadSecret loads an secret from the docker.
// If loading the secret fails, the content of the fallback file is returned.
func LoadSecret(name string, fallback string) ([]byte, error) {
	data, err := os.ReadFile("/run/secrets/" + name)
	if err == nil {
		return data, err
	}

	if !errors.Is(err, os.ErrNotExist) {
		return nil, err
	}

	return os.ReadFile(fallback)
}
