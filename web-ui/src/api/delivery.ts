import client from "./client"

export type DeliveryState = "unclaimed" | "waiting" | "delivering" | "done"

export interface DeliveryType {


    id: string
    order_id: string
    pickup: {
        id: string,
        name: string,
        location: {
            type: "point",
            coordinates: number[]
        }
    },
    destination: {
        no: string,
        street: string
        town: string
        city: string
        postal_code: string
        position: {
            type: "point",
            coordinates: number[]
        }
    },
    state: DeliveryState


    // TODO
    delivery_time?: string
    delivery_earnings?: string
    delivery_distance?: string
}

export const getNearbyDeliveries = async (): Promise<DeliveryType[]> => {
    const response = await client.get(`delivery/new`);
    return response.data;
}

export const getMyDeliveries = async (): Promise<DeliveryType[]> => {
    const response = await client.get(`delivery/my`);
    return response.data;
}

export const claimDelivery = async (id: string): Promise<DeliveryType> => {
    const response = await client.post(`delivery/${id}/claim`);
    return response.data;
}

export const pickupDelivery = async (id: string): Promise<DeliveryType> => {
    const response = await client.post(`delivery/${id}/pickup`);
    return response.data;
}

export const completeDelivery = async (id: string): Promise<DeliveryType> => {
    const response = await client.post(`delivery/${id}/complete`);
    return response.data;
}