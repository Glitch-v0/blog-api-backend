import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { genPassword } from "../passwordUtils.js";

const prisma = new PrismaClient();

async function main() {
  // Create Users
  const user1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "alice@example.com",
      username: "alice123",
      role: "user",
      password: genPassword("kittyKittyk1tty!"), // Replace with actual hashed password
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "bob@example.com",
      username: "bob456",
      role: "admin",
      password: genPassword("kittyKittyk2tty!"), // Replace with actual hashed password
    },
  });

  // Create Posts
  const post1 = await prisma.post.create({
    data: {
      id: uuidv4(),
      title: "Introduction to Prisma",
      content: "Prisma makes working with databases easy!",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      id: uuidv4(),
      title: "Advanced SQL Queries",
      content: "Learn about advanced SQL techniques.",
    },
  });

  // Create Comments with relationships to posts and users
  await prisma.comment.createMany({
    data: [
      {
        id: uuidv4(),
        content: "Great introduction to Prisma!",
        date: new Date(),
        postId: post1.id,
        userId: user1.id,
        upvotes: 5,
        downvotes: 0,
      },
      {
        id: uuidv4(),
        content: "Looking forward to learning more!",
        date: new Date(),
        postId: post1.id,
        userId: user2.id,
        upvotes: 3,
        downvotes: 1,
      },
      {
        id: uuidv4(),
        content: "This helped clarify some SQL concepts.",
        date: new Date(),
        postId: post2.id,
        userId: user1.id,
        upvotes: 8,
        downvotes: 0,
      },
    ],
  });

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
