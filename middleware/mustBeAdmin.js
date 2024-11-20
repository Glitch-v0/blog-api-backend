import prisma from "../app.js";

export async function mustBeAdmin(req, res, next) {
  if (req.user.role === "admin") {
    next();
  } else {
    console.log(req.user);
    res.status(401).json({ message: "Unauthorized" });
  }
}
