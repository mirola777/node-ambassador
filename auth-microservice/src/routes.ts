import { Router } from "express";
import {
  Login,
  Logout,
  Register,
  UpdatePassword,
  Verify,
} from "./controller/auth.controller";

export const routes = (router: Router) => {
  router.post("/api/logout", Logout);
  router.post("/api/login", Login);
  router.post("/api/register", Register);
  router.post("/api/verify", Verify);
  router.put("/api/password", UpdatePassword);
};
