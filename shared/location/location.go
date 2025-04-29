package location

import (
	"context"
	"errors"

	"googlemaps.github.io/maps"
)

var ErrLocation = errors.New("unable to get location")

type LocationService struct {
	client *maps.Client
	cache  map[string]*maps.LatLng
}

func (l *LocationService) GetLocation(ctx context.Context, address string) (*maps.LatLng, error) {
	if pos, ok := l.cache[address]; ok {
		return pos, nil
	}

	results, err := l.client.Geocode(ctx, &maps.GeocodingRequest{Address: address})
	if err != nil {
		return nil, err
	}

	var result *maps.GeocodingResult
	for i := range results {
		if results[i].PartialMatch {
			result = &results[i]
		} else if result == nil {
			result = &results[i]
		}
	}

	if result == nil {
		return nil, ErrLocation
	}

	pos := &result.Geometry.Location
	l.cache[address] = pos
	return pos, nil
}

func New(apiKey string) (*LocationService, error) {
	c, err := maps.NewClient(maps.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}

	return &LocationService{client: c, cache: map[string]*maps.LatLng{}}, nil
}
