export const config = {
    queue: process.env.APP_NOTIFY_QUEUE!,
    hostname: process.env.APP_NOTIFY_HOST!,
    username: process.env.RABBITMQ_DEFAULT_USER!,
    password: process.env.RABBITMQ_DEFAULT_PASS!,
};

export const MAX_RETRIES = 5;

const validConfig = (c: any): boolean => Object.values(c).map((v) => !!v && (typeof v !== "object" || validConfig(v))).every(v => v)

if (!validConfig(config)) {
    const cfgStr = JSON.stringify(config, (k, v) => {
        if (v === undefined) return null;

        if (k === "password" || k === "token") return "******";

        return v;
    }, 4);

    const err = `Invalid config: ${cfgStr} `;
    throw new Error(err);
}
