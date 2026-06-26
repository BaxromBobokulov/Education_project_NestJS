import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SendOtpDto} from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

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

  @Get("/dashboard")
  async getDashboardData() {
    const dashboardData = await this.authService.getDashboardData();
    return {
      success: true,
      data: dashboardData
    };
  }

  @Post("send-otp")
  async verifyPhoneNumber(@Body() payload: SendOtpDto) {
    const result = await this.authService.sendOTP(payload);
    return {
      success: true,
      data: result
    };
  }

  @Post("verify-otp")
  async verifyOtp(@Body() payload: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(payload);
    return {
      success: true,
      data: result
    };
  }

  @Put("update-password")
  async updatePassword(@Body() payload: UpdatePasswordDto) {
    console.log(payload);
    const result = await this.authService.updatePassword(payload);
    return {
      success: true,
      data: result
    };
  }
    
  
}
