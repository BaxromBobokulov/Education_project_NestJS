import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { EskizService } from 'src/common/service/sms.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, EskizService],
  exports: [StudentsService]
})
export class StudentsModule { }
export class EskizModule { }
