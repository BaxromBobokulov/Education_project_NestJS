import { ConflictException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtservice: JwtService
  ) { }

  async LoginAdmin(payload: LoginDto) {
    const checkPhone = await this.prisma.user.findUnique({
      where: { phone: payload.phone },
      select: {
        id: true,
        password: true,
        role: true
      }
    });

    if (!checkPhone) throw new ConflictException("Siz noto'g'ri telefon raqam kiritdingiz")

    const pass = await bcrypt.compare(payload.password, checkPhone.password)

    if (!pass) throw new ConflictException("Siz noto'g'ri parol kiritdingiz")

    return {
      token: this.jwtservice.sign({ id: checkPhone.id, role: checkPhone.role })
    }
  }

  async LoginTeacher(payload: LoginDto) {
    const checkPhone = await this.prisma.teacher.findUnique({
      where: { phone: payload.phone },
      select: {
        id: true,
        password: true,
        role: true
      }
    });

    if (!checkPhone) throw new ConflictException("Siz noto'g'ri telefon raqam kiritdingiz")

    const pass = await bcrypt.compare(payload.password, checkPhone.password)

    if (!pass) throw new ConflictException("Siz noto'g'ri parol kiritdingiz")

    return {
      token: this.jwtservice.sign({ id: checkPhone.id, role: checkPhone.role })
    }
  }

  async LoginStudent(payload: LoginDto) {
    const checkPhone = await this.prisma.student.findUnique({
      where: { phone: payload.phone },
      select: {
        id: true,
        password: true,
        role: true
      }
    });

    if (!checkPhone) throw new ConflictException("Siz noto'g'ri telefon raqam kiritdingiz")

    const pass = await bcrypt.compare(payload.password, checkPhone.password)

    if (!pass) throw new ConflictException("Siz noto'g'ri parol kiritdingiz")

    return {
      token: this.jwtservice.sign({ id: checkPhone.id, role: checkPhone.role })
    }
  }


}
