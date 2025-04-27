import axios from "axios"

const client = axios.create({
    baseURL: '/api/v1/',
    timeout: 1000,
    headers: {
        Authorization: "Bearer eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDU5NDkzNTcsIm5iZiI6MTc0NTY5MDE1NywiaWF0IjoxNzQ1NjkwMTU3LCJ1aWQiOiI2ODBjY2ZkMTZjNWUxZTBhNGVkOTZhYTAiLCJyb2xlcyI6WyJ1c2VyX2FkbWluIl0sInVzZXJuYW1lIjoiS2FzdW4ifQ.IktWklBNhZtMfixuI2IT-oeM9_OysqJF4BPpvVLXAvczYiZM4Lpe5tRwYb-9SolaeUIRe-X9JjE_GDNPLAe0yKBCainRMZxnWibhAnrzaj2YZou0_UZXU2Qb4t7bCDNhx24aJnhN-5IrCjKR5uzfhZgrXsRP0nOU6_BEh9zlO3woGJ4OmxlVW7QQFPOWzH___BEu2_bzsykaM1SH88HzDFTSUfqLCQ-POMGoOFWFkvnGHsv-rjueyubhgm6yvtYElnMbexXfl_M1TfM4bezvteJD8YacfwtuW_1E4Xs5MNnjWpBX4X2e-JfRxaFEizVJAMcjJU4uNcgLr-6iKCXA4w"
    }
});


export default client;