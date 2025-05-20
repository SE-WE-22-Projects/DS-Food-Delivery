import client from "./client"

export const uploadPrivateFile = async (userId: string, file: File): Promise<string> => {
    const response = await client.post(`uploads/user/${userId}`, { file: file }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data.url;
}