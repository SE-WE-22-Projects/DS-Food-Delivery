import Mail from "nodemailer/lib/mailer";
import { config } from "../config";
import { Message } from "../dto/message";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: config.gmail.email,
        pass: config.gmail.password,
    }
});

export default {
    send: (msg: Message) => {
        msg.to.map(receiver => {

            const mailOptions: Mail.Options = {
                from: config.gmail.email,
                to: receiver,
                subject: 'QuickEats',
                text: msg.content,
                html: msg.content
            };

            transporter.sendMail(mailOptions)
        })
    }
}