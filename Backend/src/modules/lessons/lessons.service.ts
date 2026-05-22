import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: any) {
    return this.prisma.lessons.create({
      data: {
        group_id: +payload.group_id,
        user_id: +payload.user_id,
        topic: payload.topic,
        description: payload.description,
      },
    });
  }

  async findByGroup(groupId: number) {
    return this.prisma.lessons.findMany({
      where: { group_id: groupId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.lessons.findUnique({
      where: { id },
      include: {
        homework: true,
        attendances: true,
      },
    });
  }
}
