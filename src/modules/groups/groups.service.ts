import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { GroupStatus } from '@prisma/client';
import { filterGroupDto } from './dto/filter-group.dto';
import { TeachersService } from '../teachers/teachers.service';
import { CoursesService } from '../courses/courses.service';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private teacherService: TeachersService,
    private courseService: CoursesService,
    private roomService: RoomsService) { }


  async create(payload: CreateGroupDto) {
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const group = await this.prisma.group.findFirst({
      where: { name: payload.name },
    });

    if (group) throw new ConflictException('Group already exists');

    await this.teacherService.findOne(payload.user_id);

    const existCourse = await this.courseService.findOne(payload.course_id);

    await this.roomService.findOne(payload.room_id);

    const startNew = timeToMinutes(payload.start_time);
    const endNew = startNew + Math.round(existCourse.duration_hours * 60);

    const roomGroups = await this.prisma.group.findMany({
      where: {
        room_id: payload.room_id,
        OR: [{ status: GroupStatus.active }, { status: GroupStatus.planned }],
      },
      select: {
        start_time: true,
        courses: {
          select: { duration_hours: true },
        },
      },
    });

    const roomTime = roomGroups.some((el) => {
      const start = timeToMinutes(el.start_time);
      const end = start + Math.round(el.courses.duration_hours * 60);
      return start < endNew && end > startNew;
    });

    if (roomTime) throw new ConflictException('Room is already reserved');

    await this.prisma.group.create({
      data: {
        name: payload.name,
        description: payload.description,
        course_id: payload.course_id,
        user_id: payload.user_id,
        room_id: payload.room_id,
        start_date: payload.start_date,
        week_day: Array.isArray(payload.week_day) ? payload.week_day : [payload.week_day],
        start_time: payload.start_time,
        max_student: payload.max_student,
      },
    });

    return { success: true, message: 'Group created successfully' };
  }



  async findAll(search: filterGroupDto) {
    let where: any = {
      status: GroupStatus.active
    }
    if (search?.name) {
      where['name'] = { contains: search.name, mode: 'insensitive' }
    }

    if (search?.start_date) {
      where['start_date'] = search.start_date
    }

    if (search?.week_day) {
      where['week_day'] = search.week_day
    }

    return await this.prisma.group.findMany({
      where,
      include: {
        courses: true,
        rooms: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            photo: true,
          }
        },
        studentGroups: {
          where: { status: 'active' },
          select: { id: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findArxiv() {
    return await this.prisma.group.findMany({
      where: { status: GroupStatus.completed },
      include: {
        courses: true,
        rooms: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            photo: true,
          }
        },
        studentGroups: {
          where: { status: 'active' },
          select: { id: true }
        }
      },
      orderBy: { created_at: 'desc' }
    })
  }

  async findOne(id: number) {
    const group = await this.prisma.group.findFirst({
      where: { id },
      include: {
        courses: true,
        rooms: true,
        users: {
          select: { id: true, first_name: true, last_name: true }
        },
        studentGroups: {
          where: { status: 'active' },
          select: { id: true }
        }
      }
    })

    if (!group) throw new NotFoundException("Guruh mavjud emas yoki inactive")
    return group
  }


  async update(id: number, updateGroupDto: UpdateGroupDto) {
    this.findOne(id)
    const updatedGroup = this.prisma.group.update({
      where: { id },
      data: updateGroupDto
    });

    return {
      message: "Group updated successfully"
    }
  }

  async remove(id: number) {
    this.findOne(id)
    await this.prisma.group.update({
      where: { id },
      data: { status: GroupStatus.completed }
    })
  }
}



