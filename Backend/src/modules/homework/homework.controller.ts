import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HomeworkService } from './homework.service';
import { AuthGuard } from '../../common/guards/jwt.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';


const fileStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller('homework')
@UseGuards(AuthGuard)
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) { }

  // ─── Homework CRUD ──────────────────────────────────────────────────────

  /**
   * POST /homework
   * O'qituvchi/Admin yangi homework yaratadi
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} must create a new homework`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: fileStorage }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.homeworkService.create({
      ...body,
      user_id: req.user.id,
      file: file ? `uploads/${file.filename}` : null,
    });
  }

  /**
   * GET /homework/group/:id
   * Guruh bo'yicha barcha homeworklarni qaytaradi
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} must get all homeworks by group`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get('group/:id')
  async findByGroup(@Param('id') id: string) {
    return this.homeworkService.findByGroup(+id);
  }

  /**
   * GET /homework/group/:id/lessons
   * Guruh bo'yicha darslarni qaytaradi (homework qo'shish modal uchun)
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} must get all lessons by group`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get('group/:id/lessons')
  async getLessonsByGroup(@Param('id') id: string) {
    return this.homeworkService.getLessonsByGroup(+id);
  }

  // ─── Homework Detail ────────────────────────────────────────────────────

  /**
   * GET /homework/:id/detail
   * Homework detail: guruh o'quvchilari + javob holatlari
   * Frontend HomeworkDetail.jsx uchun asosiy endpoint
   * Response: { homework_id, title, group_id, counts: {PENDING, CHECKED, INCOMPLETE}, students: [...] }
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} must get homework detail by id`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(':id/detail')
  async getHomeworkDetail(@Param('id') id: string) {
    return this.homeworkService.getHomeworkDetail(+id);
  }

  /**
   * GET /homework/:id/answers
   * Homework uchun barcha javoblar (to'liq ma'lumot bilan)
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} must get all answers by homework id`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(':id/answers')
  async findAnswers(@Param('id') id: string) {
    return this.homeworkService.findAnswers(+id);
  }

  // ─── Homework Answer ────────────────────────────────────────────────────

  /**
   * POST /homework/answer
   * Talaba homework javobini yuboradi
   * Body: { homework_id, title } + file (optional)
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}, ${Role.STUDENT} must submit homework answer`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT, Role.STUDENT)
  @ApiBearerAuth()
  @Post('answer')
  @UseInterceptors(FileInterceptor('file', { storage: fileStorage }))
  async submitAnswer(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.homeworkService.submitAnswer(req.user.id, {
      ...body,
      file: file ? `uploads/${file.filename}` : null,
    });
  }

  /**
   * GET /homework/answer/:answerId
   * Aniq bir talabaning javobini to'liq ma'lumot bilan qaytaradi
   * Frontend HomeworkReview.jsx uchun
   * Response: { id, user, homework, title, file, status, homeworkResults: [...] }
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} must get homework answer by id`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get('answer/:answerId')
  async getAnswerById(@Param('answerId') answerId: string) {
    return this.homeworkService.getAnswerById(+answerId);
  }

  /**
   * POST /homework/answer/:answerId/grade
   * O'qituvchi talabaning javobiga ball qo'yadi
   * Body: { score: 0-100, title?: string }
   * score >= 60 → CHECKED (Qabul qilindi)
   * score < 60  → INCOMPLETE (Qaytarildi)
   */
  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT} must grade homework answer`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Post('answer/:answerId/grade')
  async gradeAnswer(
    @Param('answerId') answerId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.homeworkService.gradeAnswer(req.user.id, +answerId, body);
  }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}, ${Role.STUDENT} must get homeworks by lesson id`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT, Role.STUDENT)
  @ApiBearerAuth()
  @Get('lesson/:id/homeworks')
  async findHomeworksByLesson(@Param('id') id: string, @Req() req: any) {
    return this.homeworkService.findHomeworksByLesson(+id, req.user.id);
  }
}