import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CourseLevel, Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { filterCourseDo } from './dto/filter-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

@ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: { type: "string", example: "NodeJs & ReactJs" },
      description: { type: "string", example: "NodeJs & ReactJs kursi" },
      price: { type: "number", example: 100 },
      duration_month: { type: "number", example: 6 },
      duration_hours: { type: "number", example: 120 },
      color : { type: "string", example: "#f8fafc" }
    }
  }
})
@Post()
async create(@Body() createCourseDto: CreateCourseDto) {
  return this.coursesService.create(createCourseDto);
}

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("all")
  findAll(
    @Query() search: filterCourseDo
  ) {
    return this.coursesService.findAll(search);
  }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("arxiv")
  findArxiv() {
    return this.coursesService.findArxiv();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}
