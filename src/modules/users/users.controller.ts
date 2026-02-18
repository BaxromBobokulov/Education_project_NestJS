import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';


@Controller('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
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
  async create(
    @Body() body: CreateUserDto,
    @UploadedFile() file: Express.Multer.File) {
    const createdUser = await this.usersService.create(body, file.filename);
    return {
      message: "User created successfully"
    }
  }

  @Get("all")
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
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
    @Body() payload: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File) {
    const photo = file?.filename
    const updatedAdmin = this.usersService.update(+id, payload, photo);
    return {
      message: "Admin updated successfully"
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const removedAdmin = this.usersService.remove(+id);
    return {
      message: "Admin removed successfully"
    }
  }
}
