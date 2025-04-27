import client from "./client";

export interface MenuType extends MenuTypeCreate {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface MenuTypeCreate extends MenuTypeUpdate {
    restaurant_id: string;
}

export interface MenuTypeUpdate {
    name: string;
    description: string;
    price: number;
    image: string;
}

export const getAllMenuItems = async (): Promise<MenuType[]> => {
    const response = await client.get("menu/");
    return response.data.data;
}

export const getRestaurantMenuItems = async (restaurantId: string): Promise<MenuType[]> => {
    const response = await client.get(`menu/restaurant/${restaurantId}`);
    return response.data.data;
}

export const getMenuItemById = async (menuId: string): Promise<MenuType> => {
    const response = await client.get(`menu/${menuId}`);
    return response.data.data;
}

export const createMenuItem = async (data: MenuTypeCreate): Promise<string> => {
    const response = await client.post("menu/", data);
    return response.data.data;
}

export const updateMenuItemById = async (menuId: string, data: MenuTypeUpdate): Promise<MenuType> => {
    const response = await client.patch(`menu/${menuId}`, data)
    return response.data.data;
}

export const deleteMenuItemById = async (menuId: string): Promise<void> => {
    const response = await client.delete(`menu/${menuId}`);
    return response.data.data;
}

const uploadMenuItemImage = async () => {

}