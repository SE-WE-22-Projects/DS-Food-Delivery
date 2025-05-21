package config

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"os"
	"reflect"
)

// LoadSecret loads an secret from the docker secrets or env vars.
// If loading the secret fails, the content of the fallback file is returned.
func LoadSecret(name string, fallback ...string) ([]byte, error) {
	strData, ok := os.LookupEnv("APP_SECRET_" + name)
	if ok {
		return []byte(strData), nil
	}

	data, loadErr := os.ReadFile("/run/secrets/" + name)
	if loadErr == nil {
		return data, nil
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
	return loadKey[*rsa.PrivateKey]("jwt_private_key", "service.priv.key")
}

// LoadJWTVerifyKey loads the signing key that is used to create jwt tokens.
func LoadJWTVerifyKey() (*rsa.PublicKey, error) {
	return loadKey[*rsa.PublicKey]("jwt_key", "service.pub.key")
}

func loadKey[T any](name string, fallback string) (T, error) {
	var key T

	data, err := LoadSecret(name, fallback)
	if err != nil {
		return key, err
	}

	block, rest := pem.Decode(data)
	if len(rest) != 0 {
		return key, fmt.Errorf("key has trailing data")
	} else if block == nil {
		return key, fmt.Errorf("unable to read key from buffer")
	}

	// load key based on
	var keyData any
	switch block.Type {
	case "BEGIN PUBLIC KEY":
		keyData, err = x509.ParsePKCS1PublicKey(block.Bytes)
	case "PUBLIC KEY":
		keyData, err = x509.ParsePKIXPublicKey(block.Bytes)
	case "RSA PRIVATE KEY":
		keyData, err = x509.ParsePKCS1PrivateKey(block.Bytes)
	case "PRIVATE KEY":
		keyData, err = x509.ParsePKCS8PrivateKey(block.Bytes)
	default:
		err = fmt.Errorf("unknown key block type %s", block.Type)
	}

	if err != nil {
		return key, err
	}

	key, ok := keyData.(T)
	if ok {
		return key, nil
	}

	return key, fmt.Errorf("key is of invalid type expected %s got %s ", reflect.TypeOf(key), reflect.TypeOf(keyData))
}
