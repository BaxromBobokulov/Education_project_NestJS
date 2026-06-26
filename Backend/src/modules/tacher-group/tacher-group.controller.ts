import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
import { TeacherGroupService } from './tacher-group.service';
import { CreateTeacherGroupDto } from './dto/create-tacher-group.dto';
import { UpdateTeacherGroupDto } from './dto/update-tacher-group.dto';

@ApiTags('Teacher-Group')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('teacher-group')
export class TeacherGroupController {
  constructor(private readonly teacherGroupService: TeacherGroupService) {}

  @ApiOperation({ summary: "Guruhga o'qituvchi biriktirish" })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  create(@Body() createTeacherGroupDto: CreateTeacherGroupDto) {
    return this.teacherGroupService.create(createTeacherGroupDto);
  }

  @ApiOperation({ summary: "Barcha biriktirilganlarni ko'rish" })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get()
  findAll() {
    return this.teacherGroupService.findAll();
  }

  @ApiOperation({ summary: "Biriktiruvni tahrirlash" })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherGroupDto: UpdateTeacherGroupDto) {
    return this.teacherGroupService.update(+id, updateTeacherGroupDto);
  }

  @ApiOperation({ summary: "Biriktiruvni o'chirish" })
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherGroupService.remove(+id);
  }
}