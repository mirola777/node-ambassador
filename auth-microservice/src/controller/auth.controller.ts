import { Request, Response } from "express";

import { Kafka } from "kafkajs";
import { admin, getAuth, signInWithEmailAndPassword } from "../firebase.config";
import { User } from "../model/user.model";

const kafkaUsername = process.env.KAFKA_USERNAME;
const kafkaPassword = process.env.KAFKA_PASSWORD;
const kafkaBroker = process.env.KAFKA_BROKER;

const kafka = new Kafka({
  clientId: "user-client",
  brokers: [kafkaBroker],
  ssl: true,
  sasl: {
    mechanism: "plain",
    username: kafkaUsername,
    password: kafkaPassword,
  },
});

const producer = kafka.producer();

export const Register = async (req: Request, res: Response) => {
  const { email, password, password_confirm } = req.body;

  if (!email || !password || !password_confirm) {
    return res.status(422).json({
      email: "Email is required",
      password: "Password is required",
    });
  }

  if (password !== password_confirm) {
    return res.status(400).send({ message: "Passwords do not match!" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    const is_ambassador = req.path.startsWith("/api/ambassador");

    await admin.auth().setCustomUserClaims(userRecord.uid, { is_ambassador });

    const user: User = {
      ...req.body,
      id: userRecord.uid,
      email,
      is_ambassador,
    };

    // send to Kafka
    await producer.connect();
    await producer.send({
      topic: "create-user",
      messages: [{ value: JSON.stringify(user) }],
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({
      email: "Email is required",
      password: "Password is required",
    });
  }

  const auth = getAuth();

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential: any) => {
      const idToken = userCredential._tokenResponse.idToken;
      if (idToken) {
        res
          .status(200)
          .json({ message: "User logged in successfully", token: idToken });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .catch((error) => {
      console.error(error);
      const errorMessage =
        error.message || "An error occurred while logging in";
      res.status(500).json({ error: errorMessage });
    });
};

export const GoogleSignIn = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRecord = await admin.auth().getUser(uid);

    const hasCustomClaims = userRecord.customClaims !== undefined;

    if (hasCustomClaims) {
      return res
        .status(200)
        .json({ message: "Google sign in successful", idToken });
    }

    const is_ambassador = req.path.startsWith("/api/ambassador");

    await admin.auth().setCustomUserClaims(userRecord.uid, { is_ambassador });

    const user: User = {
      id: userRecord.uid,
      first_name: userRecord.displayName,
      last_name: "",
      email: userRecord.email,
      is_ambassador,
    };

    await producer.connect();
    await producer.send({
      topic: "create-user",
      messages: [{ value: JSON.stringify(user) }],
    });

    res
      .status(201)
      .json({ message: "Google sign in successful", token: idToken });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const Logout = async (req: Request, res: Response) => {
  res.clearCookie("access_token");
  res.status(200).json({ message: "User logged out successfully" });
};

export const Verify = async (req: Request, res: Response, next: Function) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      return res.status(403).json({ error: "No token provided" });
    }

    if (!idToken) {
      return res.status(401).send({
        message: "unauthenticated",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken)
      return res.status(401).send({ message: "unauthenticated" });

    const isAmbassador = req.path.startsWith("/api/ambassador");

    if (
      (isAmbassador && !decodedToken.is_ambassador) ||
      (!isAmbassador && decodedToken.is_ambassador)
    ) {
      return res.status(401).send({
        message: "unauthorized",
      });
    }

    res.status(200).send({
      id: decodedToken.uid,
      is_ambassador: decodedToken.is_ambassador,
    });
  } catch (e) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }
};

export const UpdatePassword = async (req: Request, res: Response) => {
  const userId = req.headers["user-id"] as string;

  if (req.body.password !== req.body.password_confirm) {
    return res.status(400).send({
      message: "Password's do not match!",
    });
  }

  await admin.auth().updateUser(userId, { password: req.body.password });

  res.send({ message: "Password updated successfully" });
};
