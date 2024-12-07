import express from "express";
import expressAsyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import passport from "../passport.js";
import prisma from "../app.js";
import {
  mustBeAdmin,
  mustBeAdminOrOwner,
  mustBeOwner,
} from "../middleware/mustBeAdmin.js";

const router = express.Router();

router.post(
  "/posts/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  expressAsyncHandler(async (req, res) => {
    console.log("Trying to create comment...");
    console.log(req.body);
    console.log(req.params);
    if (!req.params.postId) {
      return res.status(400).json({ message: "Missing postId" });
    }
    try {
      const comment = await prisma.comment.create({
        data: {
          id: uuidv4(),
          content: req.body.content,
          date: new Date().toISOString(),
          postId: req.params.postId,
          userId: req.user.id,
        },
      });
      res.json(comment);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error creating comment" });
    }
  })
);
router.put(
  "/posts/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  mustBeOwner,
  expressAsyncHandler(async (req, res) => {
    const comment = await prisma.comment.update({
      where: {
        id: req.params.commentId,
      },
      data: {
        content: req.body.content,
      },
    });
    res.json(comment);
  })
);

router.delete(
  "/posts/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  mustBeAdminOrOwner,
  expressAsyncHandler(async (req, res) => {
    const comment = await prisma.comment.delete({
      where: {
        id: req.params.commentId,
      },
    });
    res.json(comment);
  })
);

export default router;
