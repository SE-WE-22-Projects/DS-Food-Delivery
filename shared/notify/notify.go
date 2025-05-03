package notify

import (
	"context"
	"encoding/json"

	"github.com/segmentio/kafka-go"
)

type Config struct {
	Url   string
	Topic string
}

type Notify struct {
	client *kafka.Conn
}

func (k *Notify) Connect(ctx context.Context, cfg Config) error {
	conn, err := kafka.DialLeader(ctx, "tcp", cfg.Url, cfg.Topic, 0)
	if err != nil {
		return err
	}
	k.client = conn
	return nil
}

func (k *Notify) Send(ctx context.Context, message Message) error {
	buf, err := json.Marshal(message)
	if err != nil {
		return err
	}
	_, err = k.client.WriteMessages(kafka.Message{Value: buf})
	if err != nil {
		return err
	}
	return nil
}
