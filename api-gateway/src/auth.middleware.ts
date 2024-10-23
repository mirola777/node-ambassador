import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { getMicroserviceUrl, getRemoteConfigValue } from "./firebase.config";

export async function AuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const protectedRoutes = await getRemoteConfigValue<string[]>(
      "protected_routes"
    );

    if (!protectedRoutes.includes(req.originalUrl)) return next();

    const authServiceUrl = await getMicroserviceUrl("auth");

    if (!authServiceUrl) {
      return res.status(500).send({ message: "Internal Server Error" });
    }

    try {
      const headers = { ...req.headers };

      delete headers["if-none-match"];
      delete headers["if-modified-since"];
      delete headers["content-length"];

      const url = `${authServiceUrl}/api/verify`;

      const authResponse = await axios({
        method: "POST",
        url: url,
        headers: { ...headers, host: new URL(authServiceUrl).host },
      });

      if (authResponse.status !== 200) {
        return res.status(401).send({ message: "unauthenticated" });
      }

      req.headers["user-id"] = authResponse.data.id;
      req.headers["is-ambassador"] = authResponse.data.is_ambassador;

      return next();
    } catch (error) {
      return res.status(401).send({ message: "unauthenticated" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}
