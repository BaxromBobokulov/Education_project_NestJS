import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post()
  async create(@Body() body: CreateTeacherDto,
    @UploadedFile() file: Express.Multer.File) {
    const createdTeacher = await this.teachersService.create(body, file.filename);
    return {
      message: "Teacher created successfully"
    }
  }

  @Get("all")
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

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


  @Delete(':id')
  remove(@Param('id') id: string) {
    const removedAdmin = this.teachersService.remove(+id);
    return {
      message: "Teacher removed successfully"
    }
  }
}
