import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';

@Module({
  exports:[TeachersService],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
