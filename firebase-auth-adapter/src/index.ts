import axios from "axios";
import dotenv from "dotenv";
import { EachMessagePayload, Kafka } from "kafkajs";
import { getMicroserviceUrl } from "./firebase.config";

dotenv.config();

const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;
const kafkaBroker = process.env.KAFKA_BROKER;

const kafka = new Kafka({
  clientId: "user-client",
  brokers: [kafkaBroker],
  sasl: {
    mechanism: "plain",
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

const consumer = kafka.consumer({ groupId: "user-consumer" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "create-user" });
  await consumer.run({
    eachMessage: async (message: EachMessagePayload) => {
      try {
        const usersServiceUrl = getMicroserviceUrl("users");
        const user = JSON.parse(message.message.value.toString());
        console.log(`Received user: ${JSON.stringify(user)}`);

        const response = await axios.post(`${usersServiceUrl}/`, user);
        console.log(`User created: ${response.data}`);
      } catch (error) {
        console.error(`Error processing message: ${error.message}`);
      }
    },
  });
};

run().then(console.error);
