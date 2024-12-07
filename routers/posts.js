import express from "express";
import passport from "../passport.js";
import { mustBeAdmin } from "../middleware/mustBeAdmin.js";
import expressAsyncHandler from "express-async-handler";
import prisma from "../app.js";
import { v4 as uuidv4 } from "uuid";
import { decodeToken } from "../utils/tokenUtils.js";

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

  console.log({ transformedPosts });

  res.json(transformedPosts);
});

router.get("/:postId", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: {
      id: req.params.postId,
    },
    include: {
      comments: {
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  const votes = await prisma.vote.findMany({
    where: {
      commentId: {
        in: post.comments.map((comment) => comment.id),
      },
    },
  });

  // Get user ID
  const decodedToken = decodeToken(req.headers.authorization);

  // Filter which votes belong to the user
  const userVotes = decodedToken
    ? votes.filter((vote) => vote.userId === decodedToken.id)
    : []; // If the user is not authenticated, no votes to check

  console.log({ userVotes });

  post.comments.forEach((comment) => {
    //Applies each vote to each comment in the post
    comment.votes = votes.filter((vote) => vote.commentId === comment.id);

    //Finds user votes for each comment in the post
    const userVote = userVotes.find((vote) => vote.commentId === comment.id);

    // Check if userVote exists for each comment
    if (userVote && userVote.value !== undefined) {
      // Set true/false/null for user vote
      let commentVote = null;
      if (userVote.value === 1) {
        commentVote = true; // User upvoted
      } else if (userVote.value === -1) {
        commentVote = false; // User downvoted
      } else {
        commentVote = null; // Neutral vote or no vote
      }
      comment.userVote = commentVote;
    }
  });

  console.log(post.comments);
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
