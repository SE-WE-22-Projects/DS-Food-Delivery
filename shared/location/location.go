package location

import (
	"context"

	"googlemaps.github.io/maps"
)

type LocationService struct {
	client *maps.Client
	cache  map[string]*maps.LatLng
}

func (l *LocationService) GetLocation(ctx context.Context, address string) (*maps.LatLng, error) {
	if pos, ok := l.cache[address]; ok {
		return pos, nil
	}

	result, err := l.client.Geocode(ctx, &maps.GeocodingRequest{Address: address})
	if err != nil {
		return nil, err
	}

	pos := &result[0].Geometry.Location
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
