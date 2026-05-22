import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { AuthGuard } from '../../common/guards/jwt.guard';

@Controller('lessons')
@UseGuards(AuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  async create(@Body() body: any, @Request() req: any) {
    return this.lessonsService.create({ ...body, user_id: req.user.id });
  }

  @Get('group/:id')
  async findByGroup(@Param('id') id: string) {
    return this.lessonsService.findByGroup(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(+id);
  }
}
