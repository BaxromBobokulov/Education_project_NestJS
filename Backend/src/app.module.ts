import { Module } from '@nestjs/common';
import { PrismaModule } from './core/database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursesModule } from './modules/courses/courses.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { GroupsModule } from './modules/groups/groups.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudentGroupModule } from './modules/student-group/student-group.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { StatsModule } from './modules/stats/stats.module';
import { TeacherGroupModule } from './modules/tacher-group/tacher-group.module';
import { ExamModule } from './modules/exam/exam.module';
import { RedisModule } from './modules/redis/redis.module';


@Module({
  imports: [PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    CoursesModule,
    RoomsModule,
    GroupsModule,
    StudentGroupModule,
    LessonsModule,
    HomeworkModule,
    AttendanceModule,
    StatsModule,
    TeacherGroupModule,
    ExamModule,
    RedisModule,
  ]
})
export class AppModule {}