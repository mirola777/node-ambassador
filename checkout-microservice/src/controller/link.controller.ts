import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Link } from "../entity/link.entity";

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
  const user_id = req["user-id"];

  const link = await getRepository(Link).save({
    user_id,
    code: Math.random().toString(36).substring(6),
    products: req.body.products,
  });

  res.send(link);
};

export const GetLink = async (req: Request, res: Response) => {
  res.send(
    await getRepository(Link).findOne({
      where: { code: req.params.code },
      relations: ["products"],
    })
  );
};
