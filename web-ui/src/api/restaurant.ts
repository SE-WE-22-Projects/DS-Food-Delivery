import client from "./client"

export interface RestaurantType {
    id: string,
    name: string,
    registration_no: string,
    address: {
        no: string,
        street: string
        town: string,
        city: string
        postal_code: string
    }
    logo: string
    cover: string
    description: string
    tags: string[]
    operation_time: {
        open: number
        close: number
    }
    approved: boolean;
}


export const getAllRestaurants = async (): Promise<RestaurantType[]> => {
    let resp = await client.get("restaurants/");
    return resp.data;
}

export const getAllApprovedRestaurants = async (): Promise<RestaurantType[]> => {
    const response = await client.get("restaurants/?approve=true");
    return response.data;
}

export const getRestaurantById = async (resId: string): Promise<RestaurantType> => {
    let resp = await client.get(`restaurants/${resId}`);
    return resp.data;
}