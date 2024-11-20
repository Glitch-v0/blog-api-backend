import express from "express";
import { validationResult } from "express-validator";
import expressAsyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "./passport.js";
import { genPassword } from "./passwordUtils.js";
import {
  emailValidation,
  usernameValidation,
  passwordValidation,
} from "./middleware/validators.js";
import prisma from "./app.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json("You reached the API!");
});

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
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT if authentication is successful
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    // Send the token back to the client
    res.json({ message: "You are logged in.", token });
  } catch (error) {
    console.log({ error });
    res.json(error);
  }
});

router.get("/logout", (req, res) => {
  res.json("You logged out.");
});

router.get("/posts", async (req, res) => {
  const posts = await prisma.post.findMany();
  res.json(posts);
});

router.get("/posts/:id", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: {
      id: req.params.id,
    },
  });
  res.json(post);
});

router.get("/posts/:id/comments", async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: {
      postId: req.params.id,
    },
  });
  res.json(comments);
});

router.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  expressAsyncHandler(async (req, res) => {
    const post = await prisma.post.create({
      data: {
        id: uuidv4(),
        title: req.body.title,
        content: req.body.content,
        date: new Date().toISOString(),
      },
    });
    res.json(post);
  })
);

export default router;
