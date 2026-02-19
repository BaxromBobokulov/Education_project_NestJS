import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
import { filterAdminDto } from './dto/filter-user.dto';


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

  @ApiOperation({
    summary: `${Role.SUPERADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiBearerAuth()
  @Post()
  async create(
    @Body() body: CreateUserDto,
    @UploadedFile() file: Express.Multer.File) {
    const createdUser = await this.usersService.create(body, file.filename);
    return {
      message: "Admin created successfully"
    }
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiBearerAuth()
  @Get("all")
  findAll(
    @Query() search : filterAdminDto
  ) {
    return this.usersService.findAll(search);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiBearerAuth()
  @Get("arxiv")
  findArxiv(){
    return this.usersService.findArxiv();
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
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

  @ApiBearerAuth()
  update(@Param('id') id: string,
    @Body() payload: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File) {
    const photo = file?.filename
    const updatedAdmin = this.usersService.update(+id, payload, photo);
    return {
      message: "Admin updated successfully"
    }
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    const removedAdmin = this.usersService.remove(+id);
    return {
      message: "Admin removed successfully"
    }
  }
}
