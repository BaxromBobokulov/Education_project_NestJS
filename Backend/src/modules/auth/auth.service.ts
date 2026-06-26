import { ConflictException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { Status } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
import { EskizService } from 'src/common/service/sms.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtservice: JwtService,
    private redisService: RedisService,
    private eskizService: EskizService
  ) { }

  private async otpGenerate() {
    return Math.floor(100000 + Math.random() * 900000)
  }
  async LoginAdmin(payload: LoginDto) {
    const checkEmail = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        password: true,
        role: true,
        first_name: true,
      }
    });

    if (!checkEmail) throw new ConflictException("Siz noto'g'ri email kiritdingiz")

    const pass = await bcrypt.compare(payload.password, checkEmail.password)

    if (!pass) throw new ConflictException("Siz noto'g'ri parol kiritdingiz")

    return {
      role: checkEmail.role,
      token: this.jwtservice.sign({ id: checkEmail.id, role: checkEmail.role, first_name: checkEmail.first_name })
    }
  }

  async getDashboardData() {
    const teachersCount = await this.prisma.user.count(
      {
        where: {
          role: "TEACHER",
          status: Status.active
        }
      }
    );
    const studentsCount = await this.prisma.user.count(
      {
        where: {
          role: "STUDENT",
          status: Status.active
        }
      }
    );
    const groupsCount = await this.prisma.group.count(
      {
        where: {
          status: Status.active
        }
      }
    );
    const coursesCount = await this.prisma.course.count(
      {
        where: {
          status: Status.active
        }
      }
    );

    return {
      teachersCount,
      studentsCount,
      groupsCount,
      coursesCount
    };
  }

  async sendOTP(payload: SendOtpDto) {
    const checkPhoneNumber = await this.prisma.user.findUnique({
      where: { phone: payload.phone },
      select: {
        id: true,
        role: true,
      }
    });

    const code = Number(await this.otpGenerate());
    if (!checkPhoneNumber) throw new ConflictException("Siz noto'g'ri telefon raqamini kiritdingiz")

    await this.redisService.set(payload.phone, code)
    await this.eskizService.sendSms(payload.phone, `Fixoo platformasida parolingizni tiklash uchun tasdiqlash kodi: ${code}. Kodni hech kimga bermang!`)
    return {
      success: true,
      message: "OTP send successfully",
      role: checkPhoneNumber.role
    }
  }

  async verifyOtp(payload : VerifyOtpDto){
    const getOtp = await this.redisService.get(payload.phone)
    if (!getOtp) throw new ConflictException("OTP expired")
    if (getOtp !== payload.code) throw new ConflictException("Invalid OTP")
    
    await this.redisService.del(payload.phone)
    await this.redisService.set(payload.phone + "_verified", 1)
    return {
      success: true,
      message: "OTP verified successfully",
    }
  }

  async updatePassword(payload: UpdatePasswordDto) {
    const checkPhone = await this.prisma.user.findUnique({
      where: { phone: payload.phone },
      select: {
        id: true,
        role: true,
      }
    });

    if (!checkPhone) throw new ConflictException("Siz noto'g'ri telefon raqamini kiritdingiz")

    const hashed_password = await bcrypt.hash(payload.password, 10)

    const checkPhoneVerified = await this.redisService.get(payload.phone + "_verified")
    if (!checkPhoneVerified) throw new ConflictException("Invalid OTP")

    const update_Pass = await this.prisma.user.update({
      where: {
        phone: payload.phone
      },
      data: {
        password: hashed_password
      }
    })

    return {
      success: true,
      message: "Password updated successfully"
    }
  }
}
