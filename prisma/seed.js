import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { genPassword } from "../utils/passwordUtils.js";

const prisma = new PrismaClient();

async function main() {
  //delete all data
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "alice@example.com",
      username: "alice123",
      role: "user",
      password: genPassword("kittyKittyk1tty!"),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: "bob@example.com",
      username: "bob456",
      role: "admin",
      password: genPassword("kittyKittyk2tty!"),
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
  const comment1 = await prisma.comment.create({
    data: {
      id: uuidv4(),
      content: "Great introduction to Prisma!",
      date: new Date(),
      postId: post1.id,
      userId: user1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      id: uuidv4(),
      content: "Looking forward to learning more!",
      date: new Date(),
      postId: post1.id,
      userId: user2.id,
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      id: uuidv4(),
      content: "This helped clarify some SQL concepts.",
      date: new Date(),
      postId: post2.id,
      userId: user1.id,
    },
  });

  // Create Votes
  await prisma.vote.create({
    data: {
      id: uuidv4(),
      commentId: comment1.id,
      userId: user1.id,
      value: 1,
    },
  });

  await prisma.vote.create({
    data: {
      id: uuidv4(),
      commentId: comment2.id,
      userId: user2.id,
      value: -1,
    },
  });

  await prisma.vote.create({
    data: {
      id: uuidv4(),
      commentId: comment3.id,
      userId: user1.id,
      value: 1,
    },
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
