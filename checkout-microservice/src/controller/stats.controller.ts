import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Link } from "../entity/link.entity";
import { client } from "../index";

export const Rankings = async (req: Request, res: Response) => {
  const result: string[] = await client.sendCommand([
    "ZREVRANGEBYSCORE",
    "rankings",
    "+inf",
    "-inf",
    "WITHSCORES",
  ]);
  let name;

  res.send(
    result.reduce((o, r) => {
      if (isNaN(parseInt(r))) {
        name = r;
        return o;
      } else {
        return {
          ...o,
          [name]: parseInt(r),
        };
      }
    }, {})
  );
};

export const Stats = async (req: Request, res: Response) => {
  const user_id = req.headers["user-id"] as string;

  const links = await getRepository(Link).find({
    where: { user_id },
    relations: ["orders", "orders.order_items"],
  });

  res.send(
    links.map((link) => {
      const orders = link.orders.filter((o) => o.complete);

      return {
        code: link.code,
        count: orders.length,
        revenue: orders.reduce((s, o) => s + o.ambassador_revenue, 0),
      };
    })
  );
};
