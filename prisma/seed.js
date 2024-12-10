import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import { genPassword } from "../utils/passwordUtils.js";

const prisma = new PrismaClient();

async function main() {
  // Delete all existing data
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Generate Users
  const users = [];
  for (let i = 0; i < 25; i++) {
    users.push({
      id: uuidv4(),
      email: faker.internet.email(),
      username: faker.internet.username(),
      role: faker.helpers.arrayElement(["user"]),
      password: genPassword(faker.internet.password(12)),
    });
  }

  //Create personal admin account
  users.push({
    id: uuidv4(),
    email: "bob@example.com",
    username: faker.internet.username(),
    role: "admin",
    password: genPassword("kittyKittyk2tty!"),
  });

  //Create personal viewer account
  users.push({
    id: uuidv4(),
    email: "jill@example.com",
    username: faker.internet.username(),
    role: "user",
    password: genPassword("kittyKittyk2tty!"),
  });

  await prisma.user.createMany({ data: users });

  // Fetch created users for relationships
  const createdUsers = await prisma.user.findMany();

  // Generate Posts
  const posts = [];
  for (let i = 0; i < 10; i++) {
    posts.push({
      id: uuidv4(),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
    });
  }

  await prisma.post.createMany({ data: posts });

  // Fetch created posts for relationships
  const createdPosts = await prisma.post.findMany();

  // Generate Comments
  const comments = [];
  createdPosts.forEach((post) => {
    const numComments = faker.number.int({ min: 2, max: 25 });
    for (let i = 0; i < numComments; i++) {
      const randomUser = faker.helpers.arrayElement(createdUsers);
      comments.push({
        id: uuidv4(),
        content: faker.lorem.sentences(2),
        date: faker.date.recent(30),
        postId: post.id,
        userId: randomUser.id,
      });
    }
  });

  await prisma.comment.createMany({ data: comments });

  // Fetch created comments for relationships
  const createdComments = await prisma.comment.findMany();

  // Generate Votes
  const votes = createdPosts.flatMap((post) => {
    const postComments = createdComments.filter(
      (comment) => comment.postId === post.id
    );

    return postComments.flatMap((comment) => {
      const voters = new Set();
      const numVotes = faker.number.int({ min: 1, max: 20 });

      return Array.from({ length: numVotes }).reduce((uniqueVotes, _) => {
        let randomUser;

        // Ensure a unique user for this comment
        do {
          randomUser = faker.helpers.arrayElement(createdUsers);
        } while (voters.has(randomUser.id));

        voters.add(randomUser.id);
        uniqueVotes.push({
          id: uuidv4(),
          commentId: comment.id,
          userId: randomUser.id,
          value: faker.helpers.arrayElement([1, -1]),
        });

        return uniqueVotes;
      }, []);
    });
  });

  await prisma.vote.createMany({ data: votes });

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
