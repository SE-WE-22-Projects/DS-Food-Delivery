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
}

export interface Address {
    no: string;
    street: string;
    town: string;
    city: string;
    postal_code: string;
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
    created_at: string;
    updated_at: string;
}


export const getAllOrders = async (): Promise<Order[]> => {
    const response = await client.get(`orders/`);
    return response.data;
}

export const getRestaurantOrders = async (resId: string): Promise<Order[]> => {
    const response = await client.get(`orders/by-restaurant/${resId}`);
    return response.data;
}


export const getOrderById = async (orderId: string): Promise<Order> => {
    const response = await client.get(`orders/${orderId}`);
    return response.data;
}
const setRestaurantOrderStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    await client.post(`orders/${orderId}/restaurant-status`, { status: status, reason: reason });
}

export const acceptOrderById = async (orderId: string) => {
    await setRestaurantOrderStatus(orderId, "preparing_order")
}

export const rejectOrderById = async (orderId: string, reason: string) => {
    await setRestaurantOrderStatus(orderId, "restaurant_rejected", reason)
}

export const finishOrderById = async (orderId: string) => {
    await setRestaurantOrderStatus(orderId, "awaiting_pickup")
}