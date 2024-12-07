import jwt from "jsonwebtoken";

export function createOrRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function decodeToken(token) {
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7); // Remove 'Bearer ' (7 characters)
  }
  return jwt.decode(token);
}
