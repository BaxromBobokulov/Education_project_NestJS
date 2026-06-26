import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';



@ApiBearerAuth()
@Controller('student-group')
export class StudentGroupController {
  constructor(private readonly studentGroupService: StudentGroupService) { }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Post()
  create(@Body() payload: CreateStudentGroupDto) {
    return this.studentGroupService.create(payload);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get("all")
  findAll() {
    return this.studentGroupService.findAll();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentGroupService.findOne(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentGroupDto: UpdateStudentGroupDto) {
    return this.studentGroupService.update(+id, updateStudentGroupDto);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @Get('group/:id')
  findByGroup(@Param('id') id: string) {
    return this.studentGroupService.findByGroup(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentGroupService.remove(+id);
  }
}
