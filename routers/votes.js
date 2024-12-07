import express from "express";
import { validationResult } from "express-validator";
import prisma from "../app.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { genPassword } from "../utils/passwordUtils.js";
import {
  emailValidation,
  usernameValidation,
  passwordValidation,
} from "../middleware/validators.js";
import { createOrRefreshToken } from "../utils/tokenUtils.js";

const router = express.Router();
