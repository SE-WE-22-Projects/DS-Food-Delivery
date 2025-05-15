import client from "./client";
import { uploadPublicFile } from "./upload";

export interface AddressType {
    no: string;
    street: string;
    town: string;
    city: string;
    postal_code: string;
    position: {
        lat: number,
        lng: number,
    }
}

export interface OperationTimeType {
    open: number;
    close: number
}

export interface RestaurantType extends RestaurantCreate {
    id: string;
    approved: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    owner: string;

}

export interface RestaurantCreate extends RestaurantUpdate {
    registration_no: string;
}

export interface RestaurantUpdate {
    name: string;
    address: AddressType;
    logo?: string;
    cover?: string;
    description: string;
    tags: string[];
    operation_time: OperationTimeType;
}

export const getAllRestaurants = async (): Promise<RestaurantType[]> => {
    const response = await client.get("restaurants/");
    return response.data;
}

export const getAllApprovedRestaurants = async (): Promise<RestaurantType[]> => {
    const response = await client.get("restaurants/?approve=true");
    return response.data;
}

export const getAllPendingRestaurants = async (): Promise<RestaurantType[]> => {
    const response = await client.get("restaurants/?approve=false");
    return response.data;
}

export const getAllPendingRestaurantsByOwnerId = async (): Promise<RestaurantType[]> => {
    const response = await client.get("restaurants/owner");
    return response.data;
}

export const getRestaurantById = async (restaurantId: string): Promise<RestaurantType> => {
    const response = await client.get(`restaurants/${restaurantId}`);
    return response.data;
}

export const createRestaurant = async (data: RestaurantCreate): Promise<string> => {
    const response = await client.post(`restaurants/`, data);
    return response.data;
}

export const updateRestaurantById = async (restaurantId: string, data: RestaurantUpdate): Promise<RestaurantType> => {
    const response = await client.patch(`restaurants/${restaurantId}`, data);
    return response.data;
}

export const deleteRestaurantById = async (restaurantId: string): Promise<void> => {
    await client.delete(`restaurants/${restaurantId}`);
}

export const approveRestaurantById = async (restaurantId: string, approve: boolean): Promise<void> => {
    await client.patch(`restaurants/${restaurantId}/approve`, { approved: approve });
}

export const updateLogo = async (restaurantId: string, file: File): Promise<RestaurantType> => {
    return await uploadImage(restaurantId, file, "logo");
}

export const uploadCover = async (restaurantId: string, file: File): Promise<RestaurantType> => {
    return await uploadImage(restaurantId, file, "cover");
}


const uploadImage = async (restaurantId: string, file: File, type: "cover" | "logo"): Promise<RestaurantType> => {
    const fileUrl = await uploadPublicFile(file);
    const response = await client.post(`restaurants/${restaurantId}/${type}`, { cover_url: fileUrl });
    return response.data;
}