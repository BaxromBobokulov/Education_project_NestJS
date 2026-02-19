import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: "string", example: "Mahmud" },
        last_name: { type: "string", example: "Soliyev" },
        password: { type: "string", example: "Salom12!" },
        phone: { type: "string", example: "941234567" },
        birth_date: { type: "string", example: "2000-02-20" },
        email: { type: "string", example: "mahmud@gmail.com" },
        address: { type: "string", example: "Toshknt sh. Chilonzor t." },
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
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @UploadedFile() file: Express.Multer.File) {
    const CreatedStudent = await this.studentsService.create(createStudentDto, file.filename);
    return {
      message: "Student created successfully"
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
    return this.studentsService.findAll();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN} , ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("arxiv")
  findArxiv() {
    return this.studentsService.findArxiv();
  }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.STUDENT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.STUDENT)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}, ${Role.STUDENT}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.STUDENT)
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
    @Body() payload: UpdateStudentDto,
    @UploadedFile() file?: Express.Multer.File) {
    const photo = file?.filename
    const updatedStudent = this.studentsService.update(+id, payload, photo);
    return {
      message: "Student updated successfully"
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
    const removedStudent = this.studentsService.remove(+id);
    return {
      message: "Student removed successfully"
    }
  }
}
