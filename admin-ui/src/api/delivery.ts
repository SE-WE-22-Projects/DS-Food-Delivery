import client from "./client"

export type DeliveryState = "read" | "delivering" | "done"

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
}

export const getNearbyDeliveries = async (): Promise<DeliveryType[]> => {
    const response = await client.get(`delivery/new`);
    return response.data.data;
}