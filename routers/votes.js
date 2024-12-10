import express from "express";
import { v4 as uuidv4 } from "uuid";
import passport from "../passport.js";
import prisma from "../app.js";
import expressAsyncHandler from "express-async-handler";

const router = express.Router();

router.post(
  "/comments/:commentId/vote",
  passport.authenticate("jwt", { session: false }),
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const vote = await prisma.vote.create({
      data: {
        id: uuidv4(),
        commentId: req.params.commentId,
        userId: req.user.id,
        value: req.body.value,
      },
    });
    res.json(vote);
  })
);

router.delete(
  "/comments/:commentId/vote",
  passport.authenticate("jwt", { session: false }),
  expressAsyncHandler(async (req, res) => {
    const vote = await prisma.vote.delete({
      where: {
        commentId_userId: {
          commentId: req.params.commentId,
          userId: req.user.id,
        },
      },
    });
    res.json(vote);
  })
);

router.put(
  "/comments/:commentId/vote",
  passport.authenticate("jwt", { session: false }),
  expressAsyncHandler(async (req, res) => {
    console.log(req.body);
    const vote = await prisma.vote.update({
      where: {
        commentId_userId: {
          commentId: req.params.commentId,
          userId: req.user.id,
        },
      },
      data: {
        value: req.body.value,
      },
    });
    console.log({ vote });
    res.json(vote);
  })
);

export default router;
