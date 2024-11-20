import prisma from "../app.js";

export async function mustBeAdmin(req, res, next) {
  if (req.user.role === "admin") {
    next();
  } else {
    console.log(req.user);
    res.status(401).json({ message: "Unauthorized" });
  }
}

export async function mustBeAdminOrOwner(req, res, next) {
  if (req.user.role === "admin") {
    return next();
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: req.params.commentId,
      userId: req.user.id,
    },
  });
  if (comment) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export async function mustBeOwner(req, res, next) {
  if (req.user.role === "admin") {
    return next();
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: req.params.commentId,
      userId: req.user.id,
    },
  });
  if (comment) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}
