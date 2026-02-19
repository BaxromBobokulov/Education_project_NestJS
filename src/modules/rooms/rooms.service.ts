import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { filterRoomDto } from './dto/filter-room.sto';

@Injectable()
export class RoomsService {
  constructor(private prisma : PrismaService) {}
  async create(createRoomDto: CreateRoomDto) {
    const createdRoom = await this.prisma.room.create({
      data:createRoomDto
    })
  }

  async findAll(search : filterRoomDto) {
    let where  = {}

    if(search?.name){
      where["name"] = search.name
    }
    const rooms = await this.prisma.room.findMany(
      where
    )
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
