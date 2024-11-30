import express from "express";
import passport from "../passport.js";
import { mustBeAdmin } from "../middleware/mustBeAdmin.js";
import expressAsyncHandler from "express-async-handler";
import prisma from "../app.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
router.use("/posts", router);

router.get("/", async (req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: {
      date: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  // Rename _count.comments to comments
  const transformedPosts = posts.map((post) => {
    const { _count, ...rest } = post;
    return {
      ...rest,
      comments: _count.comments,
    };
  });

  res.json(transformedPosts);
});

router.get("/:postId", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: {
      id: req.params.postId,
    },
    include: {
      comments: true,
    },
  });
  res.json(post);
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  mustBeAdmin,
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

router.put(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  mustBeAdmin,
  expressAsyncHandler(async (req, res) => {
    console.log("Recieved edit post request");
    console.log(
      `Params: ${req.params.postId} \n Updates: ${JSON.stringify(req.body)}`
    );
    const post = await prisma.post.update({
      where: {
        id: req.params.postId,
      },
      data: req.body,
    });
    res.json(post);
  })
);

router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  mustBeAdmin,
  expressAsyncHandler(async (req, res) => {
    const post = await prisma.post.delete({
      where: {
        id: req.params.postId,
      },
    });
    res.json(post);
  })
);

export default router;
