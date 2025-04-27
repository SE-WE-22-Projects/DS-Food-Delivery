import client from "./client"

export const uploadPublicFile = async (file: File): Promise<string> => {
    const response = await client.post('uploads/public', { file: file }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data.data.url;
}