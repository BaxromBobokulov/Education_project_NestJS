import { Module } from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { StudentGroupController } from './student-group.controller';
import { GroupsService } from '../groups/groups.service';
import { StudentsService } from '../students/students.service';

@Module({
  controllers: [StudentGroupController],
  providers: [StudentGroupService, StudentsService, GroupsService],
})
export class StudentGroupModule {}
