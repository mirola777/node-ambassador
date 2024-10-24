import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { createClient } from "redis";
import { createConnection } from "typeorm";
import { routes } from "./routes";

dotenv.config();

const port = process.env.PORT || 8000;

export const client = createClient({ url: "redis://checkout-redis:6379" });

createConnection().then(async () => {
  await client.connect();

  const app = express();

  app.use(cookieParser());
  app.use(express.json());

  routes(app);

  app.listen(port, () => {
    console.log(`Checkout Microservice is running at http://localhost:${port}`);
  });
});
