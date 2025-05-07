import client from "./client"

export interface CartItemType {
    item_id: string,
    cart_id: string,
    amount: number,
    name: string,
    description: string,
    price: number
}

export interface Cart {
    items: CartItemType[] | null,
    coupon?: {
        id: string,
        name: string,
        description: string,
        discount: number
    },
    sub_total: number
    total: number
}

export interface AddressType {
    "no": string,
    "street": string,
    "town": string,
    "city": string,
    "postal_code": string
}

type AddRequest = { userId: string, itemId: string, amount: number }
type RemoveRequest = { userId: string, cartItemId: string }
type UpdateRequest = { userId: string, cartItemId: string, amount: number }

type AddCouponRequest = { userId: string, coupon: string }

export const getCart = async (userId: string): Promise<Cart> => {
    const resp = await client.get(`cart/${userId}`)
    return resp.data;
}

export const addToCart = async (req: AddRequest): Promise<Cart> => {
    const resp = await client.post(`cart/${req.userId}/items`, { item: req.itemId, amount: req.amount })
    return resp.data;
}

export const removeItem = async (req: RemoveRequest): Promise<void> => {
    await client.delete(`cart/${req.userId}/items/${req.cartItemId}`)
}

export const clearCart = async (userId: string): Promise<void> => {
    await client.delete(`cart/${userId}`)
}

export const updateItem = async (req: UpdateRequest): Promise<void> => {
    const resp = await client.put(`cart/${req.userId}/items/${req.cartItemId}`, { amount: req.amount })
    return resp.data;
}

export const applyCoupon = async (req: AddCouponRequest): Promise<Cart> => {
    const resp = await client.post(`cart/${req.userId}/coupon`, { id: req.coupon })
    return resp.data;
}

export const removeCoupon = async (userId: string): Promise<Cart> => {
    const resp = await client.delete(`cart/${userId}/coupon`,)
    return resp.data;
}

export const createOrder = async (userId: string, address: AddressType): Promise<string> => {
    const resp = await client.post(`orders/from-cart/${userId}`, { address: address });
    return resp.data.orderId;
}

export const cancelOrder = async (orderId: string): Promise<void> => {
    await client.delete(`orders/${orderId}`,)
}

export const makePayment = async (orderId: string): Promise<string> => {
    const resp = await client.post(`payments/${orderId}`,)
    return resp.data.pay_url;
}
