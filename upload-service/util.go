package uploadservice

import (
	"strings"
	"unicode"
)

func sanitizeFilename(name string) string {
	return strings.Map(func(r rune) rune {
		if r <= unicode.MaxASCII {
			r = unicode.ToLower(r)
			if unicode.IsLower(r) || unicode.IsDigit(r) || r == '-' {
				return r
			}
		}
		return -1
	}, name)
}
