import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { TeachersModule } from '../teachers/teachers.module';
import { CoursesModule } from '../courses/courses.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    TeachersModule,
    CoursesModule,
    RoomsModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService]
})
export class GroupsModule {}
