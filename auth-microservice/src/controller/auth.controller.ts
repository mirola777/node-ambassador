import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../entity/user.entity";

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

export const Login = async (req: Request, res: Response) => {
  const user = await getRepository(User).findOne(
    { email: req.body.email },
    {
      select: ["id", "password", "is_ambassador"],
    }
  );

  if (!user) {
    return res.status(400).send({
      message: "invalid credentials!",
    });
  }

  if (!(await bcryptjs.compare(req.body.password, user.password))) {
    return res.status(400).send({
      message: "invalid credentials!",
    });
  }

  const adminLogin = req.path === "/api/admin/login";

  if (user.is_ambassador && adminLogin) {
    return res.status(401).send({
      message: "unauthorized",
    });
  }

  const token = sign(
    {
      id: user.id,
      scope: adminLogin ? "admin" : "ambassador",
    },
    process.env.SECRET_KEY
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, //1 day
  });

  res.send({
    message: "success",
  });
};

export const Logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", { maxAge: 0 });

  res.send({
    message: "success",
  });
};
