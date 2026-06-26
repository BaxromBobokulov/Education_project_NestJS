import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { Role } from '@prisma/client';
import { CreateTeacherGroupDto } from './dto/create-tacher-group.dto';
import { UpdateTeacherGroupDto } from './dto/update-tacher-group.dto';

@Injectable()
export class TeacherGroupService {
  constructor(private prisma: PrismaService) { }

  async create(payload: CreateTeacherGroupDto) {
    // O'qituvchini tekshirish
    const teacher = await this.prisma.user.findFirst({
      where: { id: payload.teacher_id, role: Role.TEACHER }
    });
    if (!teacher) {
      throw new NotFoundException("Bunday o'qituvchi topilmadi yoki u o'qituvchi emas");
    }

    // Guruhni tekshirish
    const group = await this.prisma.group.findUnique({
      where: { id: payload.group_id }
    });
    if (!group) {
      throw new NotFoundException("Bunday guruh topilmadi");
    }

    // Oldin biriktirilganligini tekshirish
    const existing = await this.prisma.teacherGroup.findFirst({
      where: {
        user_id: payload.teacher_id,
        group_id: payload.group_id
      }
    });
    if (existing) {
      throw new BadRequestException("Bu o'qituvchi ushbu guruhga allaqachon biriktirilgan");
    }

    return this.prisma.teacherGroup.create({
      data: {
        user_id: payload.teacher_id,
        group_id: payload.group_id
      }
    });
  }

  async findAll() {
    return this.prisma.teacherGroup.findMany({
      include: {
        users: { select: { id: true, first_name: true, last_name: true, phone: true } },
        groups: { select: { id: true, name: true } }
      }
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.teacherGroup.findUnique({
      where: { id },
      include: { users: true, groups: true }
    });
    if (!item) throw new NotFoundException("Biriktiruv topilmadi");
    return item;
  }

  async update(id: number, payload: UpdateTeacherGroupDto) {
    await this.findOne(id); // exists

    if (payload.teacher_id) {
      const teacher = await this.prisma.user.findFirst({ where: { id: payload.teacher_id, role: Role.TEACHER } });
      if (!teacher) throw new NotFoundException("Bunday o'qituvchi topilmadi");
    }

    if (payload.group_id) {
      const group = await this.prisma.group.findUnique({ where: { id: payload.group_id } });
      if (!group) throw new NotFoundException("Bunday guruh topilmadi");
    }
    return this.prisma.teacherGroup.update({ where: { id }, data: payload });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.teacherGroup.delete({ where: { id } });
  }
}