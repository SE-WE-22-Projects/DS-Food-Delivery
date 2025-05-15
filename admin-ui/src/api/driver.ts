import client from "./client";

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

export const getApplicationById = async (userId: string): Promise<DriverRequest> => {
    const response = await client.get(`users/drivers/applications/${userId}`);
    return response.data;
}

export const approveApplicationById = async (reqId: string) => {
    await client.patch(`users/drivers/applications/${reqId}`, { approved: true });
}

export const denyApplicationById = async (reqId: string, reason: string) => {
    await client.patch(`users/drivers/applications/${reqId}`, { approved: false, reason: reason });
}