import { Message, MessageSchema } from "./dto/message";
import templates, { applyTemplate, loadTemplates } from "./template";
import emailService from "./service/email-service";
import smsService from "./service/sms-service";
import { connect, queueID } from "./rabbitmq";


const TestMessage: Message = {
    to: ["test@abc.com"],
    template: "order-email",
    type: "email",
    content: { test: "Test email" }
}

loadTemplates();

const consumeNotifications = async () => {

    const channel = await connect();

    const sendTestMessage = async () => {
        const send = async () => {
            console.log("Sending");
            channel.sendToQueue(queueID, Buffer.from(JSON.stringify(TestMessage)));
        };

        setInterval(send, 5000);
    }

    sendTestMessage()

    channel.consume(queueID, async (msg) => {
        if (!msg) return;

        try {
            const data = JSON.parse(msg.content.toString());
            const notification = await MessageSchema.parseAsync(data);
            if (notification.template) {
                notification.content = applyTemplate(notification.template, notification.content);
            }
            console.log("Received new notification")

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
    }, { noAck: true });

}

consumeNotifications();