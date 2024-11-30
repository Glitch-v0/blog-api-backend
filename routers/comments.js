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

const router = express.Router({ mergeParams: true });

router.use("/posts/:postId/comments", router);

router.get("/", async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: {
      postId: req.params.postId,
    },
    orderBy: {
      date: "desc",
    },
  });
  console.log(comments);
  res.json(comments);
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  expressAsyncHandler(async (req, res) => {
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
  })
);

router.put(
  "/:commentId",
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
  "/:commentId",
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
