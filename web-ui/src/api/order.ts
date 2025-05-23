import client from "./client";

export type OrderStatus =
    | "payment_pending"
    | "payment_failed"
    | "canceled"
    | "pending_restaurant_accept"
    | "restaurant_rejected"
    | "preparing_order"
    | "awaiting_pickup"
    | "delivering"
    | "delivered";

export interface OrderItem {
    price: string;
    name: string;
    amount: number;
}

export interface Coupon {
    id: string;
    name: string;
}

export interface Restaurant {
    id: string
    name: string
    location: { type: "point", coordinates: number[] }
}

export interface Address {
    no: string;
    street: string;
    town: string;
    city: string;
    postal_code: string;
    position: { type: "point", coordinates: number[] }
}

export interface Order {
    order_id: string;
    user_id: string;
    items: OrderItem[];
    coupon?: Coupon | null;
    subtotal: number;
    total: number;
    status: OrderStatus;
    transaction_id?: string;
    restaurant_reject_reason?: string;
    assigned_driver?: string;
    restaurant: Restaurant;
    destination: Address;
    delivery_id?: string;

    // TODO: add these ?
    distance?: number
    eta?: number
    rating?: number
    delivery_fee?: number;

    created_at: string;
    updated_at: string;
}

export const getOrderById = async (orderId: string): Promise<Order> => {
    const response = await client.get(`orders/${orderId}`);
    return response.data;
}

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const response = await client.get(`orders/by-user/${userId}`);
    return response.data;
}

export const cancelOrder = async (orderId: string): Promise<void> => {
    await client.delete(`orders/${orderId}`);
}