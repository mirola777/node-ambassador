import dotenv from "dotenv";
import { EachMessagePayload, Kafka } from "kafkajs";

dotenv.config();

const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;
const kafkaBroker = process.env.KAFKA_BROKER;

const kafka = new Kafka({
  clientId: "email-client",
  brokers: [kafkaBroker],
  sasl: {
    mechanism: "plain",
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

const consumer = kafka.consumer({ groupId: "email-consumer" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "test" });
  await consumer.run({
    eachMessage: async (message: EachMessagePayload) => {
      const order = JSON.parse(message.message.value.toString());
    },
  });
};

run().then(console.error);
