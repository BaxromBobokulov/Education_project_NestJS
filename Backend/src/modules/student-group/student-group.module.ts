import { Module } from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { StudentGroupController } from './student-group.controller';
import { GroupsModule } from '../groups/groups.module';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { CoursesModule } from '../courses/courses.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    GroupsModule,
    StudentsModule,
    TeachersModule,
    CoursesModule,
    RoomsModule,
  ],
  controllers: [StudentGroupController],
  providers: [StudentGroupService],
})
export class StudentGroupModule {}
