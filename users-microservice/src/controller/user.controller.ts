import bcryptjs from "bcryptjs";
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

export const UpdatePassword = async (req: Request, res: Response) => {
  const user = req["user"];

  if (req.body.password !== req.body.password_confirm) {
    return res.status(400).send({
      message: "Password's do not match!",
    });
  }

  await getRepository(User).update(user.id, {
    password: await bcryptjs.hash(req.body.password, 10),
  });

  res.send(user);
};

export const Register = async (req: Request, res: Response) => {
  const { password, password_confirm, ...body } = req.body;

  if (password !== password_confirm) {
    return res.status(400).send({
      message: "Password's do not match!",
    });
  }

  const user = await getRepository(User).save({
    ...body,
    password: await bcryptjs.hash(password, 10),
    is_ambassador: req.path === "/api/ambassador/register",
  });

  delete user.password;

  res.send(user);
};
