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
      res.json(err);
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Stop users logging into admin side
    if (
      user.role === "user" &&
      req.get("origin") === process.env.PUBLISHER_ORIGIN
    ) {
      return res.status(401).json({
        message: `Wrong login route. Use ${process.env.VIEWER_ORIGIN} instead.`,
      });
    }

    // Generate a JWT if authentication is successful
    const token = createOrRefreshToken(user);

    // Send the token back to the client
    res.json({ message: "You are logged in.", token });
  } catch (error) {
    res.json(error);
  }
});

router.get("/logout", (req, res) => {
  res.json("You logged out.");
});

export default router;
