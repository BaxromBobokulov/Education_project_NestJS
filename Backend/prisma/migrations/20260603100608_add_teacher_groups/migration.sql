-- CreateTable
CREATE TABLE "TeacherGroup" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "TeacherGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherGroup_user_id_group_id_key" ON "TeacherGroup"("user_id", "group_id");

-- AddForeignKey
ALTER TABLE "TeacherGroup" ADD CONSTRAINT "TeacherGroup_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherGroup" ADD CONSTRAINT "TeacherGroup_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
