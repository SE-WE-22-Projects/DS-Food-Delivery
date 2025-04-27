import client from "./client"

export const getAllRestaurants = async (query?: string) => {
    let resp = await client.get("restaurants/");
    return resp.data;
}