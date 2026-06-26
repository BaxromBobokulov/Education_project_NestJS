import { Module } from '@nestjs/common';
import { TeacherGroupService } from './teacher-group.service';
import { TeacherGroupController } from './teacher-group.controller';

@Module({
  controllers: [TeacherGroupController],
  providers: [TeacherGroupService]
})
export class TeacherGroupModule {}