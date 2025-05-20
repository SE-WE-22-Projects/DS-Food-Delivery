package notify

import (
	"context"
	"encoding/json"
	"errors"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Config struct {
	Host     string
	Queue    string
	User     string
	Password string
}

type Notify struct {
	con     *amqp.Connection
	channel *amqp.Channel
	queue   amqp.Queue
}

func (n *Notify) Connect(_ context.Context, cfg Config) (err error) {
	n.con, err = amqp.DialConfig("amqp://"+cfg.Host, amqp.Config{
		SASL: []amqp.Authentication{
			&amqp.PlainAuth{
				Username: cfg.User,
				Password: cfg.Password,
			}},
	})
	if err != nil {
		return err
	}

	n.channel, err = n.con.Channel()
	if err != nil {
		return err
	}

	n.queue, err = n.channel.QueueDeclare(
		cfg.Queue,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return err
	}

	return nil
}

func (n *Notify) Send(ctx context.Context, msg message) error {
	buf, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	err = n.channel.PublishWithContext(ctx,
		"",
		n.queue.Name,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        buf,
		})
	if err != nil {
		return err
	}

	return nil
}

func (n *Notify) Close() error {
	return errors.Join(
		n.channel.Close(), n.con.Close(),
	)
}
