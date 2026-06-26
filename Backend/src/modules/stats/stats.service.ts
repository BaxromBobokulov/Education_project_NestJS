import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [students, groups, courses, teachers] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.group.count({ where: { status: 'active' } }),
      this.prisma.course.count({ where: { status: 'active' } }),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
    ]);

    return {
      totalStudents: students,
      totalGroups: groups,
      totalCourses: courses,
      totalTeachers: teachers,
    };
  }
}
