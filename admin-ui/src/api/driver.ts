import client from "./client";
import { UserType } from "./user";

export enum VehicleType {
    Car = 'car',
    Van = 'van',
    Motorbike = 'motorbike'
}

export enum DriverRequestStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected',
    withdrawn = 'withdrawn',
}

export interface DriverRequest {
    id: string;
    user_id: string;
    nic_no: string;
    driver_license: string;
    vehicle_number: string;
    vehicle_type: VehicleType;
    vehicle_image: string;
    status: DriverRequestStatus;
    admin_remark?: string;
    handled_by?: string;
    created_at: string | Date;
    updated_at: string | Date;
}


export interface DriverType extends UserType {
    driver_profile: {
        nic_no: string;
        driver_license: string;
        vehicle_number: string;
        vehicle_type: VehicleType;
        vehicle_image: string;
        status: "not_available" | "available"
        joined_at: string | Date;
    }
}

/**
 * Gets all approved drivers
 */
export const getAllDrivers = async (): Promise<DriverType[]> => {
    const response = await client.get(`drivers`);
    return response.data;
}

/**
 * Gets all pending drivers
 */
export const getPendingApplications = async (): Promise<DriverRequest[]> => {
    const response = await client.get(`drivers/applications`);
    return response.data;
}

/**
 * gets the driver registration application by id
 * @param userId user id
 */
export const getApplicationById = async (userId: string): Promise<DriverRequest> => {
    const response = await client.get(`drivers/applications/${userId}`);
    return response.data;
}

/**
 * approves the driver registration application by id
 * @param userId user id
 */
export const approveApplicationById = async (reqId: string) => {
    await client.patch(`drivers/applications/${reqId}`, { approved: true });
}

/**
 * denies the driver registration application by id
 * @param userId user id
 */
export const denyApplicationById = async (reqId: string, reason: string) => {
    await client.patch(`drivers/applications/${reqId}`, { approved: false, reason: reason });
}