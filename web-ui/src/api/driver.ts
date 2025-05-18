import client from "./client"

export type ApplicationForm = {
    nic_no: string
    vehicle_number: string
    vehicle_type: "motorbike" | "three_wheel" | "car"

    vehicle_image: string
    driver_license: string
}

export const createApplication = async (userId: string, data: ApplicationForm) => {
    await client.post(`drivers/${userId}/register`, data);
}