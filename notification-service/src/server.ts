import { Kafka } from "kafkajs";

const topicID = "notifications";

const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: ['localhost:9092', 'localhost:9093'],
});


const sendTestMessage = async () => {
    const producer = kafka.producer();

    await producer.connect()

    const send = async () => {
        console.log("send");
        await producer.send({
            topic: topicID,
            messages: [
                { value: 'Hello KafkaJS user!' },
            ],
        });
        console.log("sent");
    };

    setInterval(send, 5000);
}

const test = async () => {
    sendTestMessage()

    const consumer = kafka.consumer({ groupId: 'test-group' })

    await consumer.connect()
    await consumer.subscribe({ topic: topicID, fromBeginning: true });
    console.log("connected");

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value?.toString(),
            })
        },
    })
}

test();