package auth

import (
	"crypto/rand"
	"encoding/binary"
)

const verifyChars = "ABCDEFGHKLMNPQJRSTUVWXYZ23456789"

// generateToken generates a 6 character verification token to verify an email/phone number.
func generateToken() string {
	var b [4]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}

	value := int32(binary.LittleEndian.Uint32(b[:]))

	var token [6]byte
	for i := range 6 {
		token[i] = verifyChars[value&31]
		value >>= 5
	}

	return string(token[:])
}
