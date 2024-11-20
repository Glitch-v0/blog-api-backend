import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import router from "./router.js";

dotenv.config();

const app = express();

// set up middleware to parse form data
app.use(express.urlencoded({ extended: true }));

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

app.use("/api/v1", router);

app.listen(3000, () => console.log("Server running on port 3000"));

export default prisma;
