import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";

export const Ambassadors = async (req: Request, res: Response) => {
  res.send(await getRepository(User).find({ is_ambassador: true }));
};

export const AuthenticatedUser = async (req: Request, res: Response) => {
  const user = req["user"];

  if (req.path === "/api/admin/user") {
    return res.send(user);
  }

  // const orders = await getRepository(Order).find({
  //   where: {
  //     user_id: user.id,
  //     complete: true,
  //   },
  //   relations: ["order_items"],
  // });
  //
  // user.revenue = orders.reduce((s, o) => s + o.ambassador_revenue, 0);

  res.send(user);
};

export const UpdateInfo = async (req: Request, res: Response) => {
  const user = req["user"];

  const repository = getRepository(User);

  await repository.update(user.id, req.body);

  res.send(await repository.findOne(user.id));
};

export const Create = async (req: Request, res: Response) => {
  const user = await getRepository(User).save(req.body);

  res.send(user);
};
