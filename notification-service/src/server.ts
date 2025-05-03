import { Kafka } from "kafkajs";
import { Message, MessageSchema } from "./dto/message";
import templates, { applyTemplate, loadTemplates } from "./template";
import emailService from "./service/email-service";
import smsService from "./service/sms-service";

const topicID = "notifications-1";

const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: ['localhost:9092', 'localhost:9093'],
});



const TestMessage: Message = {
    to: ["test@abc.com"],
    template: "order-email",
    type: "email",
    content: { test: "Test email" }
}

const sendTestMessage = async () => {
    const producer = kafka.producer();

    await producer.connect()

    const send = async () => {
        console.log("send");
        await producer.send({
            topic: topicID,
            messages: [
                { value: JSON.stringify(TestMessage) },
            ],
        });
        console.log("sent");
    };

    setInterval(send, 5000);
}

loadTemplates();

const consumeNotifications = async () => {

    const consumer = kafka.consumer({ groupId: 'notification-service' });

    await consumer.connect()
    await consumer.subscribe({ topic: topicID, fromBeginning: true });
    console.log("Connected to kafka broker");

    sendTestMessage()


    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("Connected to kafka broker");
            try {
                const data = JSON.parse(message.value?.toString() ?? "{}");
                const notification = await MessageSchema.parseAsync(data);
                if (notification.template) {
                    notification.content = applyTemplate(notification.template, notification.content);
                }

                if (notification.type === "email") {
                    emailService.send(notification);
                } else if (notification.type === "sms") {
                    smsService.send(notification);
                } else {
                    throw new Error("Invalid message type")
                }
            } catch (e) {
                console.error(e);
            }

        },
    })
}

consumeNotifications();