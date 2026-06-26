import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { StudentsService } from '../students/students.service';
import { GroupsService } from '../groups/groups.service';
import { GroupStatus, Status } from '@prisma/client';

@Injectable()
export class StudentGroupService {
  constructor(
    private prisma: PrismaService,
    private studentService: StudentsService,
    private groupService: GroupsService

  ) { }
  async create(payload: CreateStudentGroupDto) {

    await this.studentService.findOne(payload.user_id)
    const group = await this.groupService.findOne(payload.group_id)

    // BUG FIX: user_id + group_id kombinatsiyasini tekshirish kerak edi
    const checkDuplicate = await this.prisma.studentGroup.findFirst({
      where: {
        user_id: payload.user_id,
        group_id: payload.group_id,
        status: Status.active
      }
    })

    if (checkDuplicate) {
      throw new ConflictException("Bu talaba ushbu guruhga allaqachon qo'shilgan")
    }

    const checkCount = await this.prisma.studentGroup.count({
      where: {
        group_id: payload.group_id,
        status: Status.active
      }
    })

    if (checkCount >= group.max_student) {
      throw new ConflictException("Guruhda boshqa joy mavjud emas")
    }

    await this.prisma.studentGroup.create({
      data: payload
    })

    return {
      message: "Student added to group successfully"
    }
    
  }






  async findAll() {
    return await this.prisma.studentGroup.findMany({
      where: { status: Status.active }
    });
  }

  async findByGroup(groupId: number) {
    return await this.prisma.studentGroup.findMany({
      where: { group_id: groupId, status: Status.active },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            photo: true,
          }
        },
      }
    });
  }

  async findOne(id: number) {
    const studentGroup = await this.prisma.studentGroup.findFirst({
      where: { id, status: Status.active }
    })

    if (!studentGroup) throw new NotFoundException("Malumotlar kiritishdagi xatolik")
    return studentGroup
  }

  async update(id: number, updateStudentGroupDto: UpdateStudentGroupDto) {
    this.findOne(id)
      await this.prisma.studentGroup.update({
        where: {id},
        data: updateStudentGroupDto
      })

      return {
        message: "Malumotlar almashtirildi"
      }
  }

  async remove(id: number) {
    this.findOne(id)
    await this.prisma.studentGroup.update({
      where:{id},
      data:{status:Status.inactive}
    })
  }
}
