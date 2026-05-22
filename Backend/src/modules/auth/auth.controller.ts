import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  async LoginAdmin(@Body() payload: LoginDto) {
    const appliedAdmin = await this.authService.LoginAdmin(payload);
    return {
      message: "You log in successfully",
      token: appliedAdmin.token
    }
  }
}
