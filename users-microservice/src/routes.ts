import { Router } from "express";
import {
  Ambassadors,
  AuthenticatedUser,
  Create,
  GetUser,
  UpdateInfo,
} from "./controller/user.controller";

export const routes = (router: Router) => {
  router.get("/api/ambassadors", Ambassadors);
  router.get("/api/user", AuthenticatedUser);
  router.post("/api/create", Create);
  router.put("/api/update", UpdateInfo);
  router.get("/api/:id", GetUser);
};
