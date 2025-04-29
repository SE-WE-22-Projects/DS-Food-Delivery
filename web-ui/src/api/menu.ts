import client from "./client";

export type MenuItemType = {
    id: string
    name: string
    description: string
    price: number
    image: string
}

export const getRestaurantItems = async (resId: string): Promise<MenuItemType[]> => {
    let resp = await client.get(`menu/restaurant/${resId}`);
    return resp.data;
}

export const getMenuItemById = async (menuId: string): Promise<MenuItemType> => {
    const response = await client.get(`menu/${menuId}`);
    return response.data;
}