import { Module } from '@nestjs/common';
import { PrismaModule } from './core/database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';


@Module({
  imports: [PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
  ]
})
export class AppModule {}
