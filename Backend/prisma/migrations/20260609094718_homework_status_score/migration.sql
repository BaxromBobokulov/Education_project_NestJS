/*
  Warnings:

  - The `status` column on the `HomeworkResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `checked_by` to the `HomeworkResult` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HomeworkStatus" AS ENUM ('PENDING', 'CHECKED', 'INCOMPLETE');

-- AlterTable
ALTER TABLE "HomeworkAnswerStudent" ADD COLUMN     "status" "HomeworkStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "HomeworkResult" ADD COLUMN     "checked_by" INTEGER NOT NULL,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "HomeworkStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Lessons" ADD COLUMN     "video" TEXT;

-- CreateTable
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HomeworkResult" ADD CONSTRAINT "HomeworkResult_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
