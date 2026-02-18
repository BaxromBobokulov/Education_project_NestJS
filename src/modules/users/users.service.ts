import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from "bcrypt"
import { PrismaService } from 'src/core/database/prisma.service';
import { Role, Status } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(payload: CreateUserDto, filename: string) {
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

    const CreatedUser = await this.prisma.user.create({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        password: hash,
        role: Role.ADMIN,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        photo: filename

      }
    })

  }


  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { status: Status.active }
    })
    return users
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, status: Status.active }
    })

    if (!user) throw new NotFoundException("Admin mavjud emas yoki inactive")
    return user
  }

  async update(id: number, payload: UpdateUserDto, photo?: string) {
    await this.findOne(id)
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10)
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...payload,
        ...(photo ? { photo: photo } : {}),
      }
    })
  }

  async remove(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { status: Status.inactive }
    })
  }
}
