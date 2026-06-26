import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { AuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateVideoLessonDto } from './dto/create-video.dto';
import { videoMulterOptions } from 'src/common/utils/videoMulterOption';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) { }

  // ─── POST /lessons ────────────────────────────────────────────────────────
  @ApiOperation({
    summary: 'Yangi dars yaratish (video ixtiyoriy)',
    description: `Ruxsat: ${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLessonDto })
  @Post()
  @UseInterceptors(FileInterceptor('video', videoMulterOptions))
  async create(
    @UploadedFile() video: Express.Multer.File,
    @Body() body: CreateLessonDto,
    @Request() req: any,
  ) {
    return this.lessonsService.create({
      group_id: body.group_id,
      user_id: req.user.id,
      topic: body.topic,
      description: body.description,
      video: video ? `uploads/videos/${video.filename}` : null,
    });
  }

  // ─── POST /lessons/video-only ─────────────────────────────────────────────
  @ApiOperation({
    summary: 'Guruh uchun yangi video dars yuklash',
    description: `Ruxsat: ${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVideoLessonDto })
  @Post('video-only')
  @UseInterceptors(FileInterceptor('video', videoMulterOptions))
  async createVideoOnly(
    @UploadedFile() video: Express.Multer.File,
    @Body() body: CreateVideoLessonDto,
    @Request() req: any,
  ) {
    if (!video) {
      throw new BadRequestException('Video fayl biriktirilishi shart!');
    }

    const lessonTopic = body.topic || video.originalname.replace(/\.[^/.]+$/, '');

    return this.lessonsService.create({
      group_id: body.group_id,
      user_id: req.user.id,
      topic: lessonTopic,
      video: `uploads/videos/${video.filename}`,
    });
  }

  // ─── GET /lessons/group/:id ───────────────────────────────────────────────
  @ApiOperation({ summary: 'Guruh bo\'yicha darslar ro\'yxati' })
  @Get('group/:id')
  async findByGroup(@Param('id') id: string) {
    const groupId = +id;
    if (isNaN(groupId)) {
      throw new BadRequestException('Guruh ID raqam bo\'lishi shart');
    }
    return this.lessonsService.findByGroup(groupId);
  }

  // ─── GET /lessons/:id ─────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Bitta darsni to\'liq ma\'lumot bilan olish' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lessonId = +id;
    if (isNaN(lessonId)) {
      throw new BadRequestException('Dars ID raqam bo\'lishi shart');
    }
    return this.lessonsService.findOne(lessonId);
  }

  // ─── PATCH /lessons/:id ──────────────────────────────────────────────────
  @ApiOperation({
    summary: 'Darsni tahrirlash (mavzu, tavsif, video)',
    description: `Ruxsat: ${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateLessonDto })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('video', videoMulterOptions))
  async update(
    @Param('id') id: string,
    @UploadedFile() video: Express.Multer.File,
    @Body() body: UpdateLessonDto,
  ) {
    const lessonId = +id;
    if (isNaN(lessonId)) {
      throw new BadRequestException('Dars ID raqam bo\'lishi shart');
    }

    const payload: any = { ...body };
    if (video) {
      payload.video = `uploads/videos/${video.filename}`;
    }
    return this.lessonsService.update(lessonId, payload);
  }

  // ─── DELETE /lessons/:id ─────────────────────────────────────────────────
  @ApiOperation({
    summary: 'Darsni arxivlash (soft delete)',
    description: `Ruxsat: ${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const lessonId = +id;
    if (isNaN(lessonId)) {
      throw new BadRequestException('Dars ID raqam bo\'lishi shart');
    }
    return this.lessonsService.remove(lessonId);
  }
}