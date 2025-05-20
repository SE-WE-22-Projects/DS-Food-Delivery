import { Message } from "../dto/message";

export default {
    send: (msg: Message) => {
        console.log("Sending sms")
    }
}