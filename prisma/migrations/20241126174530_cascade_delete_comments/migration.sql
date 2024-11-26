-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "upvotes" SET DEFAULT 0,
ALTER COLUMN "downvotes" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
