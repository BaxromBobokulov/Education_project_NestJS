import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from "bcrypt"
import { PrismaService } from 'src/core/database/prisma.service';
import { Role, Status } from '@prisma/client';
import { filterAdminDto } from './dto/filter-user.dto';

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


  async findAll(search: filterAdminDto) {
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
    const users = await this.prisma.user.findMany({
      where,
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
        update_at: true
      }
    })
    return users
  }

  async findArxiv() {
    const arxiv = await this.prisma.user.findMany({
      where: { status: Status.inactive }
    })

    return arxiv
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
    this.findOne(id)
    return this.prisma.user.update({
      where: { id },
      data: { status: Status.inactive }
    })
  }
}
