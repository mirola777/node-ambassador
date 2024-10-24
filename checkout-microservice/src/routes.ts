import { Router } from "express";
import { CreateLink, GetLink, Links } from "./controller/link.controller";
import {
  ConfirmOrder,
  CreateOrder,
  Orders,
} from "./controller/order.controller";
import { Rankings, Stats } from "./controller/stats.controller";

export const routes = (router: Router) => {
  router.get("/api/stats", Stats);
  router.get("/api/rankings", Rankings);
  router.get("/api/users/:id/links", Links);
  router.post("/api/links", CreateLink);
  router.get("/api/links/:code", GetLink);
  router.post("/api/orders", CreateOrder);
  router.get("/api/orders", Orders);
  router.post("/api/orders/confirm", ConfirmOrder);
};
