import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from "bcrypt"
import { PrismaService } from 'src/core/database/prisma.service';
import { Role, Status } from '@prisma/client';
import { filterTeacherDto } from './dto/filter-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) { }

  async create(payload: CreateTeacherDto, filename: string) {
    const hash = await bcrypt.hash(payload.password, 10)

    if (!filename) throw new BadRequestException("Iltimos rasmingizni yuklang");

    const checkEmail = await this.prisma.teacher.findUnique({
      where: { email: payload.email },
      select: { id: true }
    })

    if (checkEmail) {
      throw new ConflictException("Bu email allaqachon mavjud")
    }

    const checkPhone = await this.prisma.teacher.findUnique({
      where: { phone: payload.phone },
      select: { id: true }
    })

    if (checkPhone) {
      throw new ConflictException("Bu telefon raqam alloqachon mavjud")
    }

    const CreatedTeacher = await this.prisma.teacher.create({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        password: hash,
        role: Role.TEACHER,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        photo: filename

      }
    })

  }


  async findAll(search: filterTeacherDto) {
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
    const teachers = await this.prisma.teacher.findMany({
      where
    })
    return teachers
  }

  async findArxiv() {
    const arxiv = await this.prisma.teacher.findMany({
      where: { status: Status.inactive }
    })

    return arxiv
  }

  async findOne(id: number) {
    const teachers = await this.prisma.teacher.findFirst({
      where: { id, status: Status.active }
    })
    if (!teachers) throw new NotFoundException("Teacher mavjud emas yoki inactive")
    return teachers
  }

  async update(id: number, payload: UpdateTeacherDto, photo?: string) {
    await this.findOne(id)
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10)
    }

    return this.prisma.teacher.update({
      where: { id },
      data: {
        ...payload,
        ...(photo ? { photo: photo } : {}),
      }
    })
  }


  async remove(id: number) {
    this.findOne(id)
    return this.prisma.teacher.update({
      where: { id },
      data: { status: Status.inactive }
    })
  }

  async findGroup(id: number) {
    this.findOne(id)
    return this.prisma.group.findMany({
      where: { teacher_id: id }
    })
  }
}


