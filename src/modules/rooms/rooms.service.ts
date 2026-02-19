import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma : PrismaService) {}
  async create(createRoomDto: CreateRoomDto) {
    const createdRoom = await this.prisma.room.create({
      data:createRoomDto
    })
  }

  async findAll() {
    const rooms = await this.prisma.room.findMany()
    return rooms
  }

  async findOne(id: number) {
    const chechId = await this.prisma.room.findUnique({
      where : {id}
    })

    if(!chechId) throw new BadRequestException("Siz yuborgan xona mavjud emas")

    return chechId
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    this.findOne(id)
    const updatedRoom = await this.prisma.room.update({
      where:{id},
      data:updateRoomDto
    })

  }

  async remove(id: number) {
    this.findOne(id)
    const removedRoom = await this.prisma.room.delete({
      where: {id}
    })
  }
}
