import client from "./client"

type LoginResp = {
    token: string
    user: {
        id: string,
        name: string,
        email: string,
        roles: string[],
        profile_image: string
    }
}


export type Register = {
    address: {
        no: string
        street: string
        town: string
        city: string
        postal_code: string
        position: { type: "point", coordinates: number[] }
    }

    name: string,
    mobile_no: string,
    email: string,
    password: string
}


export const register = async (data: Register): Promise<void> => {
    let resp = await client.post(`auth/register/`, data);
}

export const login = async (email: string, password: string): Promise<LoginResp> => {
    const res = await client.post("auth/login", { email, password })
    return res.data;
}

export const logout = async (): Promise<LoginResp> => {
    const res = await client.post("auth/logout",)
    return res.data;
}

export const refresh = async (): Promise<LoginResp> => {
    const res = await client.post("auth/session/refresh")
    return res.data;
}


export const oauthStart = async (provider: string): Promise<string> => {
    if (provider !== "google") throw new Error("Unsupported provider: " + provider);

    const res = await client.get("auth/oauth/login")
    return res.data.url;
}

export const oauthComplete = async (provider: string, code: string, state: string): Promise<LoginResp> => {
    if (provider !== "google") throw new Error("Unsupported provider: " + provider);

    const res = await client.get("auth/oauth/callback", { params: { code, state } })
    return res.data;
}