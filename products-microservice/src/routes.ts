import { Router } from "express";
import {
  CreateProduct,
  DeleteProduct,
  GetProduct,
  Products,
  ProductsBackend,
  ProductsFrontend,
  UpdateProduct,
} from "./controller/product.controller";

export const routes = (router: Router) => {
  router.get("/api/backend", ProductsBackend);
  router.get("/api/frontend", ProductsFrontend);
  router.get("/api", Products);
  router.post("/api", CreateProduct);
  router.get("/api/:id", GetProduct);
  router.put("/api/:id", UpdateProduct);
  router.delete("/api/:id", DeleteProduct);
};
