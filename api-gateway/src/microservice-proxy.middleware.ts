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

    console.log(`Proxying request to ${targetUrl}`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: { ...req.headers, host: new URL(serviceUrl).host },
    });

    console.log(`Response from ${targetUrl}: ${response.status}`);

    res.status(response.status).send(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}
