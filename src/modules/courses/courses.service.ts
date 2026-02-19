import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { Status } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) { }
  async create(payload: CreateCourseDto) {
    const checkName = await this.prisma.course.findUnique({
      where: { name: payload.name },
      select: { id: true }
    })

    if (checkName) throw new ConflictException("Bu nomdagi course allaqachon mavjud")

    const createdCourse = await this.prisma.course.create({
      data: payload
    })
  }

  async findAll() {
    const courses = await this.prisma.course.findMany({
      where: { status: Status.active }
    })

    return courses
  }

  async findArxiv() {
    const arxiv = await this.prisma.course.findMany({
      where: { status: Status.inactive }
    })

    return arxiv
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findFirst({
      where: { id, status: Status.active }
    })

    if (!course) throw new NotFoundException("Course mavjud emas yoki inactive")
    return course
  }


  async update(id: number, payload: UpdateCourseDto) {
    this.findOne(id)
    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: payload
    })
  }

  async remove(id: number) {
    this.findOne(id)
    const removedCourse = await this.prisma.course.update({
      where: { id },
      data: {
        status: Status.inactive
      }
    })
  }
} 
