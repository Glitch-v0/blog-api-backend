import express from "express";
import { validationResult } from "express-validator";
import prisma from "../app.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { genPassword } from "../utils/passwordUtils.js";
import {
  emailValidation,
  usernameValidation,
  passwordValidation,
} from "../middleware/validators.js";
import { createOrRefreshToken } from "../utils/tokenUtils.js";
const router = express.Router();

router.post(
  "/register",
  emailValidation,
  usernameValidation,
  passwordValidation,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const password = req.body.password;
      const hashedPassword = genPassword(password);
      const newUser = await prisma.user.create({
        data: {
          email: req.body.email,
          username: req.body.username,
          role: "user",
          password: hashedPassword,
          id: uuidv4(),
        },
        select: {
          email: true,
          username: true,
          role: true,
        },
      });

      // Returns info minus the hashed password
      res.json({ ...newUser, password });
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
);

router.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT if authentication is successful
    const token = createOrRefreshToken(user);

    // Send the token back to the client
    console.log("You are logged in with token " + token);
    res.json({ message: "You are logged in.", token });
  } catch (error) {
    console.log({ error });
    res.json(error);
  }
});

router.get("/logout", (req, res) => {
  res.json("You logged out.");
});

export default router;
