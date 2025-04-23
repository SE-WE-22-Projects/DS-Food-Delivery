package handlers

type cartItem struct {
	Id     string         `json:"item" validate:"required,min=1,max=32"`
	Amount int            `json:"amount" validate:"required,min=1,max=100"`
	Data   map[string]any `json:"data"`
}

type couponCode struct {
	Id string `json:"id" validate:"required,min=1,max=32"`
}

type cartItemUpdate struct {
	Amount int            `json:"amount" validate:"required,min=1,max=100"`
	Data   map[string]any `json:"data"`
}
