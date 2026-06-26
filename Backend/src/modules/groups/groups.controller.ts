import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from '@prisma/client';
import { filterGroupDto } from './dto/filter-group.dto';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) { }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(":id/teacher-groups")
  getGroupsByTeacherId(@Param('id') id: string) {
    return this.groupsService.getGroupsByTeacherId(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(":id/students")
  findStudentsByGroupId(@Param('id') id: string) {
    return this.groupsService.findStudentsByGroupId(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(":id/attendance-history")
  getAttendanceHistory(@Param('id') id: string) {
    return this.groupsService.getAttendanceHistory(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(':id/attendance')
  getAttendanceForDate(@Param('id') id: string, @Query('date') date: string) {
    return this.groupsService.getAttendanceForDate(+id, date);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("all")
  findAll(
    @Query() search: filterGroupDto,
    @Request() req: any
  ) {
    return this.groupsService.findAll(search, req.user);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} , ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("arxiv")
  findArxiv(@Request() req: any) {
    return this.groupsService.findArxiv(req.user);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(':id/student-data')
  getGroupDataByStudentId(@Param('id') id: string, @Request() req: any) {
    return this.groupsService.getGroupDataByStudentId(+id, req.user);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.groupsService.findOne(+id, req.user);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}, ${Role.STUDENT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT, Role.STUDENT)
  @ApiBearerAuth()
  @Get(':id/lessons')
  getLessonsByGroupId(@Param('id') id: string, @Request() req: any) {
    return this.groupsService.getLessonsByGroupId(+id, req.user);
  }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(':id/parameters')
  getParameters(@Param('id') id: string, @Request() req: any) {
    return this.groupsService.getParameters(+id, req.user);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.TEACHER}, ${Role.ASSISTANT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.ASSISTANT)
  @ApiBearerAuth()
  @Get(':id/schedule')
  getSchedule(@Param('id') id: string) {
    return this.groupsService.getSchedule(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto);
  }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id);
  }
}
