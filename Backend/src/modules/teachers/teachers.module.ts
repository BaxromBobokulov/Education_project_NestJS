import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { EskizService } from 'src/common/service/sms.service';

@Module({
  exports:[TeachersService],
  controllers: [TeachersController],
  providers: [TeachersService, EskizService],
})
export class TeachersModule {}
