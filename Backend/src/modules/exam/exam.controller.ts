import { Controller, Get, Post, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExamService } from './exam.service';
import { AuthGuard } from '../../common/guards/jwt.guard';

@Controller('exam')
@UseGuards(AuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Request() req: any) {
    return this.examService.create({ 
      ...body, 
      user_id: req.user.id, 
      file: file ? `uploads/${file.filename}` : null 
    });
  }

  @Get('group/:id')
  async findByGroup(@Param('id') id: string) {
    return this.examService.findByGroup(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examService.findOne(+id);
  }

  @Get('group/:id/lessons')
  async getLessonsByGroup(@Param('id') id: string) {
    return this.examService.getLessonsByGroup(+id);
  }
}