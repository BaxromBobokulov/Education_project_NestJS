import { Module } from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { StudentGroupController } from './student-group.controller';
import { GroupsService } from '../groups/groups.service';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';
import { CoursesService } from '../courses/courses.service';
import { RoomsService } from '../rooms/rooms.service';

@Module({
  controllers: [StudentGroupController],
  providers: [StudentGroupService, StudentsService, GroupsService, TeachersService, CoursesService, RoomsService],
})
export class StudentGroupModule {}
