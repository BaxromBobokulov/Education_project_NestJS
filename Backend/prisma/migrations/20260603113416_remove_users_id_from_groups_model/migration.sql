/*
  Warnings:

  - You are about to drop the column `user_id` on the `Group` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_user_id_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "user_id";
