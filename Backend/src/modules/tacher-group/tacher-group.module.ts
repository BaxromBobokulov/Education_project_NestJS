import { Module } from '@nestjs/common';
import { TeacherGroupController } from './tacher-group.controller';
import { TeacherGroupService } from './tacher-group.service';

@Module({
  controllers: [TeacherGroupController],
  providers: [TeacherGroupService]
})
export class TeacherGroupModule {}