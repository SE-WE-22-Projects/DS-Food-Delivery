import axios from "axios"

const client = axios.create({
    baseURL: '/api/v1/',
    timeout: 15000,
    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
    }
});


export default client;