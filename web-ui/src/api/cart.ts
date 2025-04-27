import client from "./client"
interface CartItem {
    item_id: string,
    cart_id: string,
    amount: number,
    name: string,
    description: string,
    price: number
}

interface Cart {
    items: CartItem[],
    coupon?: {
        "id": string,
        "name": string,
        "description": string,
        "discount": number
    },
    "total": number
}

type AddRequest = { userId: string, itemId: string, amount: number }
type RemoveRequest = { userId: string, cartItemId: string }
type UpdateRequest = { userId: string, cartItemId: string, amount: number }

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

export const updateItem = async (req: UpdateRequest): Promise<void> => {
    await client.put(`cart/${req.userId}/items/${req.cartItemId}`, { amount: req.amount })
}