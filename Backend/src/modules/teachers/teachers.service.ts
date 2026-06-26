import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from "bcrypt"
import { PrismaService } from 'src/core/database/prisma.service';
import { Role, Status } from '@prisma/client';
import { filterTeacherDto } from './dto/filter-teacher.dto';
import { EskizService } from 'src/common/service/sms.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService,
    private smsService: EskizService
  ) { }

  async create(payload: CreateTeacherDto, filename: string) {
    const hash = await bcrypt.hash(payload.password, 10)

    if (!filename) throw new BadRequestException("Iltimos rasmingizni yuklang");

    const checkEmail = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true }
    })

    if (checkEmail) {
      throw new ConflictException("Bu email allaqachon mavjud")
    }

    const checkPhone = await this.prisma.user.findUnique({
      where: { phone: payload.phone },
      select: { id: true }
    })

    if (checkPhone) {
      throw new ConflictException("Bu telefon raqam alloqachon mavjud")
    }

    let groupIds: number[] = [];
    if (payload.groups) {
      try {
        groupIds = JSON.parse(payload.groups);
      } catch (e) { }
    }

    const { groups, ...restPayload } = payload;


    const CreatedTeacher = await this.prisma.user.create({
      data: {
        ...restPayload,
        password: hash,
        role: Role.TEACHER,
        photo: filename,
        ...(groupIds.length > 0 ? {
          teacherGroups: {
            create: groupIds.map(groupId => ({ group_id: groupId }))
          }
        } : {})
      }
    })

    await this.smsService.sendSms(payload.phone, `NajotEdu kabinetingiz https://najotedu.softwareengineer.uz/login.\n Login: ${payload.phone} Parol: ${payload.password}}`)
    return CreatedTeacher;
  }


  async findAll(search: filterTeacherDto) {
    let where = {
      status: Status.active,
      role: Role.TEACHER,
    }

    if (search?.first_name) {
      where["first_name"] = search.first_name
    }

    if (search?.last_name) {
      where["last_name"] = search.last_name
    }

    if (search?.phone) {
      where["phone"] = search.phone
    }

    if (search?.email) {
      where["email"] = search.email
    }

    const teachers = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        phone: true,
        email: true,
        address: true,
        photo: true,
        created_at: true,
        teacherGroups: {
          select: {
            group_id: true,
            groups: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return teachers
  }

  async findArxiv() {
    const arxiv = await this.prisma.user.findMany({
      where: { status: Status.inactive }
    })

    return arxiv
  }

  async findOne(id: number) {
    const teacher = await this.prisma.user.findFirst({
      where: { id, status: Status.active },
      include: {
        teacherGroups: {
          where: { status: Status.active },
          include: {
            groups: {
              include: {
                courses: true,
                rooms: true
              }
            }
          }
        }
      }
    });
    if (!teacher) throw new NotFoundException("Teacher mavjud emas yoki inactive");
    return {
      ...teacher,
      salary: "4,500,000 UZS",
      gender: "Erkak"
    };
  }

  async update(id: number, payload: UpdateTeacherDto, photo?: string) {
    await this.findOne(id)
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10)
    }

    let groupIds: number[] | undefined = undefined;
    if (payload.groups) {
      try {
        groupIds = JSON.parse(payload.groups);
      } catch (e) { }
    }

    const { groups, ...restPayload } = payload;

    return this.prisma.user.update({
      where: { id },
      data: {
        ...restPayload,
        ...(photo ? { photo: photo } : {}),
        ...(groupIds ? {
          teacherGroups: {
            deleteMany: {},
            create: groupIds.map(groupId => ({ group_id: groupId }))
          }
        } : {})
      }
    })
  }


  async remove(id: number) {
    this.findOne(id)
    return this.prisma.user.update({
      where: { id },
      data: { status: Status.inactive }
    })
  }

  async findGroup(id: number) {
    this.findOne(id)
    return this.prisma.teacherGroup.findMany({
      where: { user_id: id }
    })
  }
}
