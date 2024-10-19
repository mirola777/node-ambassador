import { Router } from "express";
import { Login, Logout } from "./controller/auth.controller";
import { AuthMiddleware } from "./middleware/auth.middleware";

export const routes = (router: Router) => {
  router.post("/api/logout", AuthMiddleware, Logout);
  router.post("/api/login", Login);
};
