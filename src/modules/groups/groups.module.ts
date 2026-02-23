import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TeachersService } from '../teachers/teachers.service';
import { CoursesService } from '../courses/courses.service';
import { RoomsService } from '../rooms/rooms.service';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, TeachersService, CoursesService,RoomsService],
  exports: [GroupsService]
})
export class GroupsModule {}
