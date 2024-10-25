import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Link } from "../entity/link.entity";
import { getMicroserviceUrl } from "../firebase.config";

export const Links = async (req: Request, res: Response) => {
  const links = await getRepository(Link).find({
    where: {
      user: req.params.id,
    },
    relations: ["orders", "orders.order_items"],
  });

  res.send(links);
};

export const CreateLink = async (req: Request, res: Response) => {
  const user_id = req.headers["user-id"] as string;

  const link = await getRepository(Link).save({
    user_id,
    code: Math.random().toString(36).substring(6),
    products: req.body.products,
  });

  res.send(link);
};

export const GetLink = async (req: Request, res: Response) => {
  const link = await getRepository(Link).findOne({
    where: { code: req.params.code },
  });

  const productsServiceUrl = await getMicroserviceUrl("products");

  const products = await Promise.all(
    link.products.map(async (p) => {
      const response = await fetch(`${productsServiceUrl}/api/${p}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      return response.json();
    })
  );

  res.send({ ...link, products });
};
