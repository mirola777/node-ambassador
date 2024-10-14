import axios from "axios";
import { Request, Response } from "express";
import { getMicroserviceUrl } from "./firebase.config";

export async function MicroserviceProxyMiddleware(req: Request, res: Response) {
  try {
    const microservice = req.params.microservice;
    const serviceUrl = await getMicroserviceUrl(microservice);

    if (!serviceUrl) {
      res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
      return;
    }

    const targetUrl = `${serviceUrl}${req.originalUrl.replace(
      `/api/${microservice}`,
      ""
    )}`;

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: { ...req.headers, host: new URL(serviceUrl).host },
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}
