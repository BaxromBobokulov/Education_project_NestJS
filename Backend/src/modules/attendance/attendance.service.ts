import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * O'qituvchi tomonidan davomat qabul qilish.
   * Har bir yuborish uchun:
   *  - Yangi Lessons yozuvi yaratiladi (group_id, user_id=teacher, topic, description, created_at=date)
   *  - Har bir o'quvchi uchun Attendance yozuvi yaratiladi
   *  - "Boshqa" mavzusi uchun attendance yozuvlari saqlanadi
   */
  async submitJournal(payload: SubmitAttendanceDto, userId: number) {
    const { group_id, topic, description, students, date } = payload;

    if (!group_id || !students || students.length === 0) {
      throw new BadRequestException('group_id va students kerak');
    }

    // 1. Guruh mavjudligini tekshiramiz
    const group = await this.prisma.group.findUnique({
      where: { id: +group_id },
      include: {
        studentGroups: {
          where: { status: 'active' },
          select: { user_id: true }
        }
      }
    });

    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    // 2. Faqat shu guruhning faol o'quvchilari uchun ruxsat beramiz
    const validStudentIds = new Set(group.studentGroups.map(sg => sg.user_id));
    const invalidStudents = students.filter(s => !validStudentIds.has(+s.student_id));
    if (invalidStudents.length > 0) {
      throw new BadRequestException(
        `Quyidagi o'quvchilar bu guruhga tegishli emas: ${invalidStudents.map(s => s.student_id).join(', ')}`
      );
    }

    // 3. Sana ko'rsatilgan bo'lsa, shu sanada lesson yaratamiz
    //    Aks holda, hozirgi vaqt bilan yaratiladi
    const lessonDate = date ? new Date(date) : new Date();
    if (isNaN(lessonDate.getTime())) {
      throw new BadRequestException("Noto'g'ri sana formati");
    }
    // Faqat sanani saqlaymiz (vaqtni 12:00:00 ga o'rnatamiz)
    lessonDate.setHours(12, 0, 0, 0);

    // Sananing boshlanish va tugash nuqtalarini aniqlaymiz (kunlik chek uchun)
    const startOfDay = new Date(lessonDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(lessonDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Ushbu sana uchun davomat allaqachon kiritilganligini tekshiramiz
    const existingLesson = await this.prisma.lessons.findFirst({
      where: {
        group_id: +group_id,
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingLesson) {
      throw new BadRequestException("Ushbu sana uchun davomat allaqachon qabul qilingan va uni o'zgartirib bo'lmaydi");
    }

    // 4. Transaction orqali lesson + attendance yozuvlarini yaratamiz
    const result = await this.prisma.$transaction(async (tx) => {
      // Yangi Lesson yaratamiz
      const lesson = await tx.lessons.create({
        data: {
          group_id: +group_id,
          user_id: +userId,
          topic: topic,
          description: description || '',
          created_at: lessonDate,
        }
      });

      // Har bir o'quvchi uchun Attendance yozuvi
      const attendanceData = students.map((s) => ({
        user_id: +userId,    // teacher
        lesson_id: lesson.id,
        student_id: +s.student_id,
        isPresent: !!s.isPresent,
      }));

      const created = await tx.attendance.createMany({
        data: attendanceData
      });

      return {
        lesson,
        attendance_count: created.count
      };
    });

    return {
      success: true,
      message: 'Davomat muvaffaqiyatli saqlandi',
      lesson_id: result.lesson.id,
      topic: result.lesson.topic,
      date: result.lesson.created_at,
      attendance_count: result.attendance_count,
      present_count: students.filter(s => s.isPresent).length,
      absent_count: students.filter(s => !s.isPresent).length
    };
  }

  /**
   * Guruh uchun ma'lum bir sanada kiritilgan davomatni olish
   */
  async getAttendanceByDate(groupId: number, date: string) {
    if (!date) {
      throw new BadRequestException('date parametri kerak');
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Noto\'g\'ri sana formati');
    }
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const lessons = await this.prisma.lessons.findMany({
      where: {
        group_id: +groupId,
        created_at: {
          gte: targetDate,
          lt: nextDate
        }
      },
      include: {
        attendances: true,
      },
      orderBy: { created_at: 'desc' }
    });

    return {
      group_id: +groupId,
      date,
      lessons: lessons.map(l => ({
        lesson_id: l.id,
        topic: l.topic,
        description: l.description,
        created_at: l.created_at,
        attendance: l.attendances
      }))
    };
  }
}
