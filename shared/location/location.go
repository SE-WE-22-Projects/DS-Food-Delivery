package location

import (
	"context"
	"errors"
	"sync"

	"googlemaps.github.io/maps"
)

var ErrLocation = errors.New("unable to get location")

type LatLng struct {
	maps.LatLng
	Exact bool
	Type  string
}

// Deprecated: use [Provider] instead.
type LocationService = Provider //nolint: all

type Provider struct {
	client *maps.Client
	cache  sync.Map
}

// GetLocation tries to the the latitude and longitude for the given address
func (l *Provider) GetLocation(ctx context.Context, address string) (*LatLng, error) {
	if pos, ok := l.cache.Load(address); ok {
		return pos.(*LatLng), nil
	}

	// fetch the location using geocode request.
	results, err := l.client.Geocode(ctx, &maps.GeocodingRequest{Address: address})
	if err != nil {
		return nil, err
	}

	// select the first exact match or partial match if no exact matches exist.
	var result *maps.GeocodingResult
	for idx := range results {
		if !results[idx].PartialMatch {
			result = &results[idx]
			break
		}

		if result == nil {
			result = &results[idx]
		}
	}

	// no matches
	if result == nil {
		return nil, ErrLocation
	}

	pos := &LatLng{LatLng: result.Geometry.Location, Exact: !result.PartialMatch, Type: "point"}
	l.cache.Store(address, pos)
	return pos, nil
}

// New creates a new location provider.
// apiKey is the google maps api key to use.
func New(apiKey string) (*Provider, error) {
	c, err := maps.NewClient(maps.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}

	return &Provider{client: c}, nil
}
