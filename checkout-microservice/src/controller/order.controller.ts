import { Request, Response } from "express";
import { Kafka } from "kafkajs";
import Stripe from "stripe";
import { getConnection, getRepository } from "typeorm";
import { Link } from "../entity/link.entity";
import { OrderItem } from "../entity/order-item.entity";
import { Order } from "../entity/order.entity";
import { getMicroserviceUrl } from "../firebase.config";
import { client } from "../index";
import { getOrderRepository } from "../repository/order.repository";

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

export const Orders = async (req: Request, res: Response) => {
  const orders = await getOrderRepository().getCompletedOrders();

  res.send(
    orders.map((order: Order) => ({
      id: order.id,
      name: order.name,
      email: order.email,
      total: order.total,
      created_at: order.created_at,
      order_items: order.order_items,
    }))
  );
};

export const CreateOrder = async (req: Request, res: Response) => {
  const body = req.body;

  const link = await getRepository(Link).findOne({
    where: { code: body.code },
  });

  if (!link) return res.status(400).send({ message: "Invalid link!" });

  const usersMicroserviceUrl = await getMicroserviceUrl("users");

  const response = await fetch(`${usersMicroserviceUrl}/api/${link.user_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const user = await response.json();

  const queryRunner = getConnection().createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let order = new Order();

    order.user_id = user.id;
    order.ambassador_email = user.email;
    order.code = body.code;
    order.first_name = body.first_name;
    order.last_name = body.last_name;
    order.email = body.email;
    order.address = body.address;
    order.country = body.country;
    order.city = body.city;
    order.zip = body.zip;

    order = await queryRunner.manager.save(order);

    const line_items = [];

    for (let p of body.products) {
      const productsServiceUrl = await getMicroserviceUrl("products");

      const response = await fetch(
        `${productsServiceUrl}/api/${p.product_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const product = await response.json();

      const orderItem = new OrderItem();
      orderItem.order = order;
      orderItem.product_title = product.title;
      orderItem.price = product.price;
      orderItem.quantity = p.quantity;
      orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
      orderItem.admin_revenue = 0.9 * product.price * p.quantity;

      await queryRunner.manager.save(orderItem);

      line_items.push({
        name: product.title,
        description: product.description,
        images: [product.image],
        amount: 100 * product.price,
        currency: "usd",
        quantity: p.quantity,
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET, {
      apiVersion: "2020-08-27",
    });

    const source = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      success_url: `${process.env.CHECKOUT_URL}/success?source={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CHECKOUT_URL}/error`,
    });

    order.transaction_id = source["id"];
    await queryRunner.manager.save(order);

    await queryRunner.commitTransaction();

    res.send(source);
  } catch (e) {
    await queryRunner.rollbackTransaction();

    return res.status(400).send({ message: "Error occurred!" });
  }
};

export const ConfirmOrder = async (req: Request, res: Response) => {
  const repository = getOrderRepository();

  const order = await repository.getByTransactionId(req.body.source);

  if (!order) return res.status(404).send({ message: "Order not found!" });

  await repository.update(order.id, { complete: true });

  const usersMicroserviceUrl = await getMicroserviceUrl("users");

  const response = await fetch(`${usersMicroserviceUrl}/api/${order.user_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const user = await response.json();

  await client.zIncrBy("rankings", order.ambassador_revenue, user.first_name);

  const kafkaProducer = kafka.producer();

  await kafkaProducer.connect();
  await kafkaProducer.send({
    topic: "email",
    messages: [{ value: JSON.stringify(order) }],
  });

  res.send({ message: "success" });
};
