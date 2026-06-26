import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { MediaController } from './media.controller';
import { PrismaModule } from '../../core/database/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LessonsController, MediaController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
