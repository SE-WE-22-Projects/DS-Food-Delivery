import { config } from "../config";
import { Message } from "../dto/message";
import twilio from 'twilio';



const client = twilio(config.twilio.sid, config.twilio.token);



export default {
    send: (msg: Message) => {
        console.log("Sending sms");
        msg.to.forEach(receiver => {
            client.messages
                .create({
                    body: msg.content,
                    to: receiver,
                    from: config.twilio.no,
                })
                .then((message) => console.log("SMS sent: " + message.sid));
        })
    }
}