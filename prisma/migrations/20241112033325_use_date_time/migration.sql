/*
  Warnings:

  - The `date` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `date` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "date",
ADD COLUMN     "date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
