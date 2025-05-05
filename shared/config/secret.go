package config

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"os"
)

// LoadSecret loads an secret from the docker.
// If loading the secret fails, the content of the fallback file is returned.
func LoadSecret(name string, fallback ...string) ([]byte, error) {
	data, loadErr := os.ReadFile("/run/secrets/" + name)
	if loadErr == nil {
		return data, loadErr
	}

	if !errors.Is(loadErr, os.ErrNotExist) || len(fallback) == 0 {
		return nil, loadErr
	}

	data, fallbackErr := os.ReadFile(fallback[0])
	if fallbackErr == nil {
		return data, nil
	}

	return nil, fmt.Errorf("failed to load secret %w", errors.Join(loadErr, fallbackErr))
}

// LoadJWTSigningKey loads the signing key that is used to create jwt tokens.
func LoadJWTSigningKey() (*rsa.PrivateKey, error) {
	data, err := LoadSecret("jwt_private_key", "service.priv.key")
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)
	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return key, nil
}

// LoadJWTVerifyKey loads the signing key that is used to create jwt tokens.
func LoadJWTVerifyKey() (*rsa.PublicKey, error) {
	data, err := LoadSecret("jwt_key", "service.pub.key")
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)
	key, err := x509.ParsePKCS1PublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return key, nil
}
