import client from "./client";

export type UserInfo = {
    id: string,
    name: string,
    mobile_no: string,
    email: string,
    address: {
        no: string,
        street: string,
        town: string,
        city: string,
        postal_code: string
    },
    roles: string[],
    profile_image: string
}

export const getUserById = async (userId: string): Promise<UserInfo> => {
    let resp = await client.get(`users/${userId}`);
    return resp.data;
}


