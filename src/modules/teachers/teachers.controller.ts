import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) { }

  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: "string", example: "Mahmud" },
        last_name: { type: "string", example: "Soliyev" },
        password: { type: "string", example: "Salom12!" },
        phone: { type: "string", example: "941234567" },
        email: { type: "string", example: "mahmud@gmail.com" },
        address: { type: "string", example: "string" },
        photo: { type: "string", format: "binary" }
      }
    }
  })

  @UseInterceptors(FileInterceptor("photo", {
    storage: diskStorage({
      destination: "src/uploads",
      filename: (req, file, cb) => {
        const filename = Date.now() + "." + file.mimetype.split("/")[1]
        cb(null, filename)
      }
    })
  }))

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Post()
  async create(@Body() body: CreateTeacherDto,
    @UploadedFile() file: Express.Multer.File) {
    const createdTeacher = await this.teachersService.create(body, file.filename);
    return {
      message: "Teacher created successfully"
    }
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("all")
  findAll() {
    return this.teachersService.findAll();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} , ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("arxiv")
  findArxiv() {
    return this.teachersService.findArxiv();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN} , ${Role.TEACHER}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN} , ${Role.TEACHER}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER)
  @ApiBearerAuth()
  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: "src/uploads",
      filename: (req, file, cb) => {
        const filename = Date.now() + "." + file.mimetype.split("/")[1]
        cb(null, filename)
      }
    })
  }))

  update(@Param('id') id: string,
    @Body() payload: UpdateTeacherDto,
    @UploadedFile() file?: Express.Multer.File) {
    const photo = file?.filename
    const updatedTeacher = this.teachersService.update(+id, payload, photo);
    return {
      message: "Teacher updated successfully"
    }
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    const removedAdmin = this.teachersService.remove(+id);
    return {
      message: "Teacher removed successfully"
    }
  }
}
