import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { EskizService } from 'src/common/service/sms.service';
import { RedisService } from '../redis/redis.service';

@Module({
  imports : [
    JwtModule.register({
      global:true,
      secret:"shaftoli",
      signOptions:{
        expiresIn: '1h'
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,EskizService, RedisService],
})
export class AuthModule {}
