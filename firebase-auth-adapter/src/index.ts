import dotenv from "dotenv";
import { EachMessagePayload, Kafka } from "kafkajs";

dotenv.config();

const port = process.env.PORT || 8000;

const kafka = new Kafka({
  clientId: "email-client",
  brokers: ["host.docker.internal:9094"],
  sasl: {
    mechanism: "plain",
    username: "user",
    password: "bitnami",
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
