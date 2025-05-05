import { sleep } from "./util";
import amqp from "amqplib";

export const queueID = "notifications-1";
const MAX_RETRIES = 5;
const URL = process.env.APP_SERVICES_RABBITMQ ?? "localhost";

/**
 * Connects to the rabbitmq server and creates and returns the notification channel 
 * @returns the massage channel for notifications
 */
export const connect = async (): Promise<amqp.Channel> => {
    const retries = 0;

    console.log("Connecting to rabbitmq on " + URL);
    while (true) {

        try {
            const connection = await amqp.connect({
                hostname: URL,
                username: process.env.RABBITMQ_DEFAULT_USER!,
                password: process.env.RABBITMQ_DEFAULT_PASS!,
            });
            console.log("Connected to rabbitmq");

            const channel = await connection.createChannel();
            channel.assertQueue(queueID, {
                durable: true
            });

            return channel;

        } catch (e) {
            const err = (e as Error).message ?? "";
            if (retries < MAX_RETRIES && err.indexOf("ECONNREFUSED") != -1) {
                console.log("RabbitMQ connection failed. Retrying in 2 seconds...")
                await sleep(2000);
                continue;
            }

            throw e;
        }
    }
}

