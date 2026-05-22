import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { AuthGuard } from '../../common/guards/jwt.guard';

@Controller('homework')
@UseGuards(AuthGuard)
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.homeworkService.create({ ...body, user_id: req.user.id });
  }

  @Get('group/:id')
  async findByGroup(@Param('id') id: string) {
    return this.homeworkService.findByGroup(+id);
  }

  @Get(':id/answers')
  async findAnswers(@Param('id') id: string) {
    return this.homeworkService.findAnswers(+id);
  }
}
