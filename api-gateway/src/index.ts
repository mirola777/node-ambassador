import console from "console";
import dotenv from "dotenv";
import express from "express";
import { AuthMiddleware } from "./auth.middleware";
import { MicroserviceProxyMiddleware } from "./microservice-proxy.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.all(
  "/api/:client/:microservice/*",
  AuthMiddleware,
  MicroserviceProxyMiddleware
);
app.listen(port, () => {
  console.log(`API Gateway is running at http://localhost:${port}`);
});
