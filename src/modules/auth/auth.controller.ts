import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("admin")
  async LoginAdmin(@Body() payload: LoginDto) {
    const appliedAdmin = await this.authService.LoginAdmin(payload);
    return {
      message: "You log in successfully",
      token: appliedAdmin.token
    }
  }

  @Post("teacher")
  async LoginTeacher(@Body() payload: LoginDto) {
    const appliedTeacher = await this.authService.LoginTeacher(payload);
    return {
      message: "You log in successfully",
      token: appliedTeacher.token
    }
  }

  @Post("student")
  async LoginStudent(@Body() payload: LoginDto) {
    const appliedStudent = await this.authService.LoginStudent(payload);
    return {
      message: "You log in successfully",
      token: appliedStudent.token
    }
  }



}
