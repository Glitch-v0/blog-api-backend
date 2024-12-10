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
  let posts;

  if (req.get("origin") === process.env.PUBLISHER_ORIGIN) {
    console.log("getting ALL posts");
    posts = await prisma.post.findMany({
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
  } else {
    console.log("getting PUBLISHED posts");
    posts = await prisma.post.findMany({
      where: {
        published: true,
      },
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
  }

  // console.log({ posts });
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
  const { postId } = req.params;
  if (!postId || postId === "undefined") {
    // Invalid postId, return a 400 error early
    return res.status(400).json({ message: "Invalid or missing postId" });
  }
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

    // Check if comment belongs to user
    if (decodedToken) {
      if (comment.userId === decodedToken.id) {
        comment.isOwner = true;
      } else {
        comment.isOwner = false;
      }
    }
  });

  res.json(post);
});

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  mustBeAdmin,
  expressAsyncHandler(async (req, res) => {
    if (req.get.origin !== process.env.PUBLISHER_ORIGIN) {
      return res.status(401).json({
        message: `You are not authorized to publish posts from this route.`,
      });
    }
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
    console.log("Reached the put route");
    if (req.get("origin") !== process.env.PUBLISHER_ORIGIN) {
      console.log("DENIED!");
      return res.status(401).json({
        message: `You are not authorized to update posts from this route.`,
      });
    }
    console.log("Trying prisma query...");
    const post = await prisma.post.update({
      where: {
        id: req.params.postId,
      },
      data: req.body,
    });
    console.log({ post });
    res.json(post);
  })
);

router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  mustBeAdmin,
  expressAsyncHandler(async (req, res) => {
    if (req.get("origin") !== process.env.PUBLISHER_ORIGIN) {
      return res.status(401).json({
        message: `You are not authorized to delete posts from this route.`,
      });
    }
    const post = await prisma.post.delete({
      where: {
        id: req.params.postId,
      },
    });
    res.json(post);
  })
);

export default router;
