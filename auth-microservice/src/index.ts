import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { routes } from "./routes";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.use(cookieParser());
app.use(express.json());

routes(app);

app.listen(port, () => {
  console.log(`Auth Microservice is running at http://localhost:${port}`);
});
