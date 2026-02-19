import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from "bcrypt"
import { Role, Status } from '@prisma/client';
import { filterDto } from './dto/filter-student.dto';
import { serialize } from 'v8';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) { }
  async create(payload: CreateStudentDto, filename: string) {
    const hash = await bcrypt.hash(payload.password, 10);

    if (!filename) throw new BadRequestException("Iltimos ramingizni yuklang");

    const checkEmail = await this.prisma.student.findUnique({
      where: { email: payload.email },
      select: { id: true }
    })

    if (checkEmail) {
      throw new ConflictException("Bu email allaqachon mavjud")
    }

    const checkPhone = await this.prisma.student.findUnique({
      where: { phone: payload.phone },
      select: { id: true }
    })

    if (checkPhone) {
      throw new ConflictException("Bu telefon raqam alloqachon mavjud")
    }

    const CreatedStudent = await this.prisma.student.create({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        password: hash,
        role: Role.STUDENT,
        phone: payload.phone,
        birth_date: payload.birth_date,
        email: payload.email,
        address: payload.address,
        photo: filename
      }
    })

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

    const students = await this.prisma.student.findMany({
      where,
      select: {
        id:true,
        first_name:true,
        last_name:true,
        role:true,
        phone:true,
        email:true,
        address:true,
        photo:true,
        status:true,
        created_at:true,
        update_at:true
      }
    })
    return students
  }

  async findArxiv() {
    const arxiv = await this.prisma.student.findMany({
      where: { status: Status.inactive }
    })

    return arxiv 
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findFirst({
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

    return this.prisma.student.update({
      where: { id },
      data: {
        ...payload,
        ...(photo ? { photo: photo } : {}),
      }
    })
  }

  async remove(id: number) {
    this.findOne(id)
    return this.prisma.student.update({
      where: { id },
      data: { status: Status.inactive }
    })
  }
}
