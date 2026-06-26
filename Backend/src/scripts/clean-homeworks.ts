import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL not found in environment");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting duplicate homework cleanup...');
  // Find all lessons with duplicate homework entries
  const duplicates = await prisma.homework.groupBy({
    by: ['lesson_id'],
    _count: {
      id: true,
    },
    having: {
      lesson_id: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  console.log(`Found ${duplicates.length} lessons with duplicate homeworks.`);

  for (const dup of duplicates) {
    const lessonId = dup.lesson_id;
    // Get all homeworks for this lesson ordered by ID ascending (we keep the first one, which is the oldest)
    const homeworks = await prisma.homework.findMany({
      where: { lesson_id: lessonId },
      orderBy: { id: 'asc' },
    });

    const [keep, ...remove] = homeworks;
    console.log(`Lesson ${lessonId}: Keeping homework ${keep.id} ("${keep.title}"). Deleting ${remove.length} duplicates...`);

    for (const hw of remove) {
      // Delete child answer relations first to avoid foreign key violations
      const studentAnswers = await prisma.homeworkAnswerStudent.findMany({
        where: { homework_id: hw.id },
      });

      for (const answer of studentAnswers) {
        // Delete homeworkResults
        await prisma.homeworkResult.deleteMany({
          where: { homework_answer_id: answer.id },
        });
      }

      await prisma.homeworkAnswerStudent.deleteMany({
        where: { homework_id: hw.id },
      });

      // Delete the homework itself
      await prisma.homework.delete({
        where: { id: hw.id },
      });
      console.log(`Deleted duplicate homework ID ${hw.id}`);
    }
  }

  console.log('Cleanup finished.');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
