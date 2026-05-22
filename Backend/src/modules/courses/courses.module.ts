import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';

@Module({
  exports:[CoursesService],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
