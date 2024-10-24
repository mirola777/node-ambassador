import console from "console";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { AuthMiddleware } from "./auth.middleware";
import { MicroserviceProxyMiddleware } from "./microservice-proxy.middleware";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5000",
    ],
  })
);
app.all(
  "/api/:client/:microservice/*",
  AuthMiddleware,
  MicroserviceProxyMiddleware
);
app.listen(port, () => {
  console.log(`API Gateway is running at http://localhost:${port}`);
});
