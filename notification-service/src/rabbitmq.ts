import { config, MAX_RETRIES } from "./config";
import { sleep } from "./util";
import amqp from "amqplib";

/**
 * Connects to the rabbitmq server and creates and returns the notification channel 
 * @returns the massage channel for notifications
 */
export const connect = async (): Promise<amqp.Channel> => {
    let retries = 0;

    console.log("Connecting to rabbitmq on " + config.hostname);
    while (true) {

        try {
            const connection = await amqp.connect({
                hostname: config.hostname,
                username: config.username,
                password: config.password,
            });
            console.log("Connected to rabbitmq");

            const channel = await connection.createChannel();
            channel.assertQueue(config.queue, {
                durable: true
            });

            return channel;

        } catch (e) {
            const err = (e as Error).message ?? "";
            if (retries < MAX_RETRIES && err.indexOf("ECONNREFUSED") != -1) {
                retries++;
                console.log("RabbitMQ connection failed. Retrying in 2 seconds...")
                await sleep(2000);
                continue;
            }

            throw e;
        }
    }
}

