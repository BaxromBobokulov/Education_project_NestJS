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
    const checkEmail = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        password: true,
        role: true
      }
    });

    if (!checkEmail) throw new ConflictException("Siz noto'g'ri email kiritdingiz")

    const pass = await bcrypt.compare(payload.password, checkEmail.password)

    if (!pass) throw new ConflictException("Siz noto'g'ri parol kiritdingiz")

    return {
      token: this.jwtservice.sign({ id: checkEmail.id, role: checkEmail.role })
    }
  }
}
