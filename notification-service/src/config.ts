export const config = {
    queue: process.env.APP_NOTIFY_QUEUE!,
    hostname: process.env.APP_NOTIFY_HOST!,
    username: process.env.RABBITMQ_DEFAULT_USER!,
    password: process.env.RABBITMQ_DEFAULT_PASS!
};

export const MAX_RETRIES = 5;

if (!config.queue || !config.hostname || !config.username || !config.password) {

    // hide password from console
    if (config.password) {
        config.password = "*******"
    }

    const cfgStr = JSON.stringify(config, (_k, v) => v === undefined ? null : v)
    const err = `Invalid RabbitMQ config: ${cfgStr} `;
    throw new Error(err);
}
