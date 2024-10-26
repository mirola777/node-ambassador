import dotenv from "dotenv";
import { EachMessagePayload, Kafka } from "kafkajs";
import { createTransport } from "nodemailer";

dotenv.config();

const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;
const kafkaBroker = process.env.KAFKA_BROKER;

const kafka = new Kafka({
  clientId: "email-client",
  brokers: [kafkaBroker],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

const consumer = kafka.consumer({ groupId: "email-consumer" });

const transporter = createTransport({
  host: "10.128.0.11",
  port: 1025,
});

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "email" });
  await consumer.run({
    eachMessage: async (message: EachMessagePayload) => {
      const order = JSON.parse(message.message.value.toString());

      const admin_revenue = order.order_items.reduce(
        (acc: number, item: any) => acc + item.admin_revenue,
        0
      );

      const ambassador_revenue = order.order_items.reduce(
        (acc: number, item: any) => acc + item.ambassador_revenue,
        0
      );

      await transporter.sendMail({
        from: "from@example.com",
        to: "admin@admin.com",
        subject: "An order has been completed",
        html: `Order #${order.id} with a total of $${admin_revenue} has been completed`,
      });

      await transporter.sendMail({
        from: "from@example.com",
        to: order.ambassador_email,
        subject: "An order has been completed",
        html: `You earned $${ambassador_revenue} from the link #${order.code}`,
      });
    },
  });

  transporter.close();
};

run().then(console.error);
