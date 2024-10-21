import { Request, Response } from "express";

import { admin, getAuth, signInWithEmailAndPassword } from "../firebase.config";

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

    const isAmbassador = req.path.startsWith("/api/ambassador");

    await admin.auth().setCustomUserClaims(userRecord.uid, { isAmbassador });

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
        res.cookie("access_token", idToken, { httpOnly: true });
        res.status(200).json({ message: "User logged in successfully" });
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

export const Logout = async (req: Request, res: Response) => {
  res.clearCookie("access_token");
  res.status(200).json({ message: "User logged out successfully" });
};

export const Verify = async (req: Request, res: Response, next: Function) => {
  try {
    const idToken = req.cookies.access_token;

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
      (isAmbassador && !decodedToken.isAmbassador) ||
      (!isAmbassador && decodedToken.isAmbassador)
    ) {
      return res.status(401).send({
        message: "unauthorized",
      });
    }

    res
      .status(200)
      .send({ message: "User verified successfully", user: decodedToken });
  } catch (e) {
    return res.status(401).send({
      message: "unauthenticated",
    });
  }
};
