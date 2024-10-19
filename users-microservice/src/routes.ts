import { Router } from "express";
import {
  Ambassadors,
  AuthenticatedUser,
  Register,
  UpdateInfo,
  UpdatePassword,
} from "./controller/user.controller";

export const routes = (router: Router) => {
  router.get("/api/ambassadors", Ambassadors);
  router.get("/api/user", AuthenticatedUser);
  router.post("/api/register", Register);
  router.put("/api/users/info", UpdateInfo);
  router.put("/api/users/password", UpdatePassword);
};
