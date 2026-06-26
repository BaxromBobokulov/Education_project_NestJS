import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: any) {
    return this.prisma.exam.create({
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
    return this.prisma.exam.findMany({
      where: { group_id: groupId },
      include: {
        lessons: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.exam.findUnique({
      where: { id },
      include: {
        lessons: true,
      },
    });
  }

  async getLessonsByGroup(groupId: number) {
    return this.prisma.lessons.findMany({
      where: { group_id: groupId },
      select: {
        id: true,
        topic: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
