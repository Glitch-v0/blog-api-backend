import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import router from "./router.js";
import cors from "cors";

dotenv.config();

const app = express();

// set up middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

export const prisma = new PrismaClient();

app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
  origins: [process.env.PUBLISHER_ORIGIN, process.env.VIEWER_ORIGIN],
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log(`Route called: ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/v1", router);
app.all("*", (req, res) => {
  res.status(404).json({ message: "Not found" });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal server error!");
});

app.listen(3000, () => console.log("Server running on port 3000"));

export default prisma;
