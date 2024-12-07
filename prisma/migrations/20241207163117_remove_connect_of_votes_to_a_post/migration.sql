/*
  Warnings:

  - You are about to drop the column `postId` on the `Vote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_postId_fkey";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "postId";
