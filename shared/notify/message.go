package notify

type MsgType string

const (
	MsgTypeEmail MsgType = "email"
	MsgTypSMS    MsgType = "sms"
)

type Message interface {
	message()
}

type TemplateMessage struct {
	Type     MsgType        `json:"type"`
	To       []string       `json:"to"`
	Content  map[string]any `json:"content"`
	Template string         `json:"template"`
}

func (*TemplateMessage) message() {}

type SimpleMessage struct {
	Type    MsgType  `json:"type"`
	To      []string `json:"to"`
	Content string   `json:"content"`
}

func (*SimpleMessage) message() {}
