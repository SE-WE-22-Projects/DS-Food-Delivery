import client from "./client"

interface RestaurantType {
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
}


export const getAllRestaurants = async (query?: string): Promise<RestaurantType[]> => {
    let resp = await client.get("restaurants/");
    return resp.data;
}

export const getRestaurantById = async (resId: string): Promise<RestaurantType> => {
    let resp = await client.get(`restaurants/${resId}`);
    return resp.data;
}