import client from "./client"

type LoginResp = {
    token: string
    user: {
        id: string,
        name: string,
        email: string,
        profile_image: string
        roles: string[]
    }
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