package config

import (
	"errors"
	"fmt"
	"os"
)

// LoadSecret loads an secret from the docker.
// If loading the secret fails, the content of the fallback file is returned.
func LoadSecret(name string, fallback string) ([]byte, error) {
	data, loadErr := os.ReadFile("/run/secrets/" + name)
	if loadErr == nil {
		return data, loadErr
	}

	if !errors.Is(loadErr, os.ErrNotExist) {
		return nil, loadErr
	}

	data, fallbackErr := os.ReadFile(fallback)
	if fallbackErr == nil {
		return data, nil
	}

	return nil, fmt.Errorf("failed to load secret %w", errors.Join(loadErr, fallbackErr))
}
