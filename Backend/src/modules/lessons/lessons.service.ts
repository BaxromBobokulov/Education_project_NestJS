import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) { }

  // ─── Create ──────────────────────────────────────────────────────────────
  async create(payload: {
    group_id: number;
    user_id: number;
    topic: string;
    description?: string;
    video?: string | null;
  }) {
    // 1. Guruh mavjudligini tekshirish
    const groupExists = await this.prisma.group.findUnique({
      where: { id: +payload.group_id }
    });
    if (!groupExists) {
      throw new NotFoundException("Bunday guruh mavjud emas");
    }

    // 2. O'qituvchi/foydalanuvchi mavjudligini tekshirish
    const userExists = await this.prisma.user.findUnique({
      where: { id: +payload.user_id }
    });
    if (!userExists) {
      throw new NotFoundException("Bunday o'qituvchi/foydalanuvchi topilmadi");
    }

    // 3. Mavzu nomi bo'sh emasligini tekshirish
    if (!payload.topic || !payload.topic.trim()) {
      throw new BadRequestException("Dars mavzusi bo'sh bo'lishi mumkin emas");
    }

    // 4. Guruhda ayni shu mavzudagi dars bor-yo'qligini tekshirish
    const duplicateTopic = await this.prisma.lessons.findFirst({
      where: {
        group_id: +payload.group_id,
        topic: payload.topic.trim(),
        status: 'active'
      }
    });
    if (duplicateTopic) {
      throw new BadRequestException("Ushbu guruhda bunday mavzudagi dars allaqachon mavjud");
    }

    return this.prisma.lessons.create({
      data: {
        group_id: +payload.group_id,
        user_id: +payload.user_id,
        topic: payload.topic.trim(),
        description: payload.description || null,
        video: payload.video || null,
      },
    });
  }

  // ─── findByGroup ─────────────────────────────────────────────────────────
  async findByGroup(groupId: number) {
    const groupExists = await this.prisma.group.findUnique({
      where: { id: groupId }
    });
    if (!groupExists) {
      throw new NotFoundException("Bunday guruh mavjud emas");
    }

    return this.prisma.lessons.findMany({
      where: { 
        group_id: groupId,
        status: 'active' 
      },
      include: {
        attendances: true,
        homework: { select: { id: true, title: true } },
        exams: { select: { id: true, title: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── findOne ──────────────────────────────────────────────────────────────
  async findOne(id: number) {
    const lesson = await this.prisma.lessons.findFirst({
      where: { 
        id,
        status: 'active'
      },
      include: {
        homework: { select: { id: true, title: true, file: true } },
        attendances: true,
        exams: { select: { id: true, title: true } },
        groups: { select: { id: true, name: true } },
        users: { select: { id: true, first_name: true, last_name: true } },
      },
    });
    if (!lesson) {
      throw new NotFoundException("Dars topilmadi yoki arxivlangan");
    }
    return lesson;
  }

  // ─── update ──────────────────────────────────────────────────────────────
  async update(id: number, payload: any) {
    const lesson = await this.findOne(id); // Dars mavjudligini va activeligini tekshiradi

    const data: any = {};
    if (payload.topic !== undefined) {
      if (!payload.topic || !payload.topic.trim()) {
        throw new BadRequestException("Dars mavzusi bo'sh bo'lishi mumkin emas");
      }

      // Mavzu unikal bo'lishi kerak (bu darsdan tashqari)
      const duplicateTopic = await this.prisma.lessons.findFirst({
        where: {
          group_id: lesson.group_id,
          topic: payload.topic.trim(),
          status: 'active',
          id: { not: id }
        }
      });
      if (duplicateTopic) {
        throw new BadRequestException("Ushbu guruhda bunday mavzudagi dars allaqachon mavjud");
      }
      data.topic = payload.topic.trim();
    }

    if (payload.description !== undefined) {
      data.description = payload.description || null;
    }

    if (payload.video !== undefined) {
      data.video = payload.video || null;
    }

    return this.prisma.lessons.update({ 
      where: { id }, 
      data 
    });
  }

  // ─── remove ──────────────────────────────────────────────────────────────
  async remove(id: number) {
    await this.findOne(id); // Dars mavjudligini tekshiradi
    
    await this.prisma.lessons.update({
      where: { id },
      data: { status: 'inactive' },
    });
    
    return { success: true, message: "Dars muvaffaqiyatli arxivlandi (o'chirildi)" };
  }
}