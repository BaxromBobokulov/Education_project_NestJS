import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: any) {
    return this.prisma.homework.create({
      data: {
        group_id: +payload.group_id,
        user_id: +payload.user_id,
        lesson_id: +payload.lesson_id,
        title: payload.title,
        file: payload.file || null,
      },
    });
  }

  async findByGroup(groupId: number) {
    return this.prisma.homework.findMany({
      where: { group_id: groupId },
      include: {
        lessons: true,
        homeworkAnswerStudents: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAnswers(homeworkId: number) {
    return this.prisma.homeworkAnswerStudent.findMany({
      where: { homework_id: homeworkId },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, photo: true }
        }
      },
    });
  }
}
