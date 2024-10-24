import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { createConnection } from "typeorm";
import { routes } from "./routes";

dotenv.config();

const port = process.env.PORT || 8000;

createConnection().then(async () => {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());

  routes(app);

  app.listen(port, () => {
    console.log(`API Gateway is running at http://localhost:${port}`);
  });
});
