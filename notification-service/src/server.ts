import { Message, MessageSchema } from "./dto/message";
import { applyTemplate, loadTemplates } from "./template";
import emailService from "./service/email-service";
import smsService from "./service/sms-service";
import { connect } from "./rabbitmq";
import { config } from "./config";


// const TestMessage: Message = {
//     to: ["fake-email@not-a-real.domain"],
//     type: "email",
//     content: "Test SMS"
// }


const start = async () => {
    await loadTemplates();

    const channel = await connect();

    // const send = async () => {
    //     channel.sendToQueue(config.queue, Buffer.from(JSON.stringify(TestMessage)));
    // };
    // send()

    channel.consume(config.queue, async (msg) => {
        if (!msg) return;

        try {
            console.log("Received: " + msg.content.toString())
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

start();