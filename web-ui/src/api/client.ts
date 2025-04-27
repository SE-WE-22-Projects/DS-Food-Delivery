import axios, { Axios, AxiosError, AxiosResponse } from "axios";

const client = axios.create({
    baseURL: "/api/v1/",
    headers: { Authorization: "Bearer " + import.meta.env.VITE_API_KEY }
});

client.interceptors.response.use(function (response) {
    if (typeof response.data.ok !== "boolean" || !response.data.data || !response.data.ok) {
        return Promise.reject(new Error(`Invalid response from server: ${response.data}`));
    }
    response.data = response.data.data;
    return response;
}, function (error: AxiosError) {
    if (error.response && typeof (error.response as AxiosResponse).data.ok === "boolean") {
        const response: AxiosResponse = error.response;
        if (!response.data.error || response.data.ok) {
            return Promise.reject(new Error(`Invalid response from server: ${response.data}`));
        }

        let message = response.data.error;
        if (response.data.reason) {
            message += ": " + response.data.reason;
        }

        message += "\n" + error.message

        error.message = message;

        return Promise.reject(new Error(response.data.error));
    }

    return Promise.reject(error);
});

export default client;
