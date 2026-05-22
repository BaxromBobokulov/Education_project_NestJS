import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { filterRoomDto } from './dto/filter-room.sto';

@Controller('rooms')
export class RoomsController { 
  constructor(private readonly roomsService: RoomsService) { }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Post("add")
  async create(@Body() createRoomDto: CreateRoomDto) {
    const createdRoom = await this.roomsService.create(createRoomDto);
    return {
      message: "Room created succcessfully",
      data: createdRoom
    }
  }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get("all")
  findAll(
    @Query() search : filterRoomDto
  ) {
    return this.roomsService.findAll(search);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }


  @ApiOperation({
    summary: `${Role.SUPERADMIN}, ${Role.ADMIN}`
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
