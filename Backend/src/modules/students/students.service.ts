import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from "bcrypt"
import { Role, Status } from '@prisma/client';
import { filterDto } from './dto/filter-student.dto';
import { serialize } from 'v8';
import { EskizService } from 'src/common/service/sms.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService, private smsService: EskizService) { }
  async create(payload: CreateStudentDto, filename: string) {
    const hash = await bcrypt.hash(payload.password, 10);

    if (!filename) throw new BadRequestException("Iltimos ramingizni yuklang");

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
      throw new ConflictException("Bu telefon raqam allaqachon mavjud")
    }

    let groupIds: number[] = [];
    if (payload.groups) {
      try {
        groupIds = JSON.parse(payload.groups);
      } catch (e) { }
    }

    const { groups, ...restPayload } = payload;

    const CreatedStudent = await this.prisma.user.create({
      data: {
        ...restPayload,
        password: hash,
        role: Role.STUDENT,
        photo: filename,
        ...(groupIds.length > 0 ? {
          studentGroups: {
            create: groupIds.map(groupId => ({ group_id: groupId }))
          }
        } : {})
      }
    })

    await this.smsService.sendSms(payload.phone, `NajotEdu kabinetingiz https://najotedu.softwareengineer.uz/login.\n Login: ${payload.phone} Parol: ${payload.password}}`)

    return CreatedStudent;
  }

  async findAll(search: filterDto) {
    let where = {
      status: Status.active
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

    const students = await this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        ...where
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        role: true,
        phone: true,
        email: true,
        address: true,
        photo: true,
        status: true,
        created_at: true,
        update_at: true,
        studentGroups: {
          select: {
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
    return students
  }

  async getgroupsbyStudentId(id: number) {
    const studentGroups = await this.prisma.studentGroup.findMany({
      where: { user_id: id },
      select: {
        groups: {
          select: {
            id: true,
            name: true,
            start_time: true,
            start_date: true,
            teacherGroups: {
              select: {
                users: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!studentGroups) throw new NotFoundException("Sizga tegishli guruhlar mavjud emas yoki student topilmadi")
    return studentGroups
  }


  async findArxiv() {
    const arxiv = await this.prisma.user.findMany({
      where: { status: Status.inactive }
    })

    return arxiv
  }

  async findOne(id: number) {
    const student = await this.prisma.user.findFirst({
      where: { id, status: Status.active }
    })

    if (!student) throw new NotFoundException("Student mavjud emas yoki inactive")
    return student
  }

  async update(id: number, payload: UpdateStudentDto, photo?: string) {
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
          studentGroups: {
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
}
