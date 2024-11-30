import express from "express";
import userRouter from "./routers/user.js";
import postRouter from "./routers/posts.js";
import commentRouter from "./routers/comments.js";

const router = express.Router();
router.use(userRouter, postRouter, commentRouter);

export default router;
