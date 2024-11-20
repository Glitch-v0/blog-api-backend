import { body } from "express-validator";

export const passwordValidation = [
  body("password")
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 12 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character."
    )
    .matches(/^\S*$/)
    .withMessage("Password must not contain spaces."),
];

export const emailValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail()
    .isLength({ max: 50 })
    .withMessage("Email must not exceed 50 characters."),
];

export const usernameValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters.")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores.")
    .not()
    .isIn(["admin", "superuser", "root", "user", "guest", "test", "demo"]) // Avoid restricted usernames
    .withMessage("Username is restricted, please choose another."),
];
