import axios, { AxiosError } from "axios";
import { Request, Response } from "express";
import { getMicroserviceUrl } from "./firebase.config";

export async function MicroserviceProxyMiddleware(req: Request, res: Response) {
  try {
    const microservice = req.params.microservice;
    const client = req.params.client;
    const serviceUrl = await getMicroserviceUrl(microservice);

    if (!serviceUrl) {
      res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
      return;
    }

    const targetUrl = `${serviceUrl}${req.originalUrl.replace(
      `/api/${client}/${microservice}`,
      `/api`
    )}`;

    console.log(`Proxying request to ${targetUrl}`);

    const headers = { ...req.headers };

    delete headers["if-none-match"];
    delete headers["if-modified-since"];
    delete headers["content-length"];

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: { ...headers, host: new URL(serviceUrl).host },
      timeout: 5000,
    });

    console.log(`Response from ${targetUrl}: ${response.status}`);

    // Set headers of the response
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value as string);
    });

    return res.status(response.status).send(response.data);
  } catch (error) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        res.status(axiosError.response.status).send(axiosError.response.data);
        return;
      }
    }

    const errorMessage = (error as Error).message || "Internal Server Error";

    console.error(`There was an error: ${errorMessage}`);

    return res.status(500).send(errorMessage);
  }
}
