import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { GroupStatus, Role, Status } from '@prisma/client';
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

    // 1. Guruh nomi takrorlanmasin
    const existing = await this.prisma.group.findFirst({
      where: { name: payload.name },
    });
    if (existing) throw new ConflictException('Bu nomdagi guruh allaqachon mavjud');

    // 2. Kurs va xona mavjudligini tekshirish
    const existCourse = await this.courseService.findOne(payload.course_id);
    await this.roomService.findOne(payload.room_id);

    // 3. Xona vaqt to'qnashuvini tekshirish
    const startNew = timeToMinutes(payload.start_time);
    const endNew = startNew + Math.round(existCourse.duration_hours * 60);

    const roomGroups = await this.prisma.group.findMany({
      where: {
        room_id: payload.room_id,
        OR: [{ status: GroupStatus.active }, { status: GroupStatus.planned }],
      },
      select: {
        start_time: true,
        courses: { select: { duration_hours: true } },
      },
    });

    const hasConflict = roomGroups.some((el) => {
      const start = timeToMinutes(el.start_time);
      const end = start + Math.round(el.courses.duration_hours * 60);
      return start < endNew && end > startNew;
    });
    if (hasConflict) throw new ConflictException('Bu xona ushbu vaqtda band');

    // 4. Guruh + teacher/student larni bir tranzaksiyada yaratish
    const teacherIds: number[] = (payload.teacher_ids || []).map(Number).filter(Boolean);
    const studentIds: number[] = (payload.student_ids || []).map(Number).filter(Boolean);

    const result = await this.prisma.$transaction(async (tx) => {
      // 4a. Guruhni yaratish
      const newGroup = await tx.group.create({
        data: {
          name: payload.name,
          description: payload.description,
          course_id: payload.course_id,
          room_id: payload.room_id,
          start_date: payload.start_date,
          week_day: Array.isArray(payload.week_day) ? payload.week_day : [payload.week_day],
          start_time: payload.start_time,
          max_student: payload.max_student,
        },
      });

      // 4b. O'qituvchilarni biriktirish
      let teachersAdded = 0;
      if (teacherIds.length > 0) {
        const validTeachers = await tx.user.findMany({
          where: { id: { in: teacherIds }, role: Role.TEACHER },
          select: { id: true },
        });
        const validIds = validTeachers.map((t) => t.id);
        const { count } = await tx.teacherGroup.createMany({
          data: validIds.map((uid) => ({ user_id: uid, group_id: newGroup.id })),
          skipDuplicates: true,
        });
        teachersAdded = count;
      }

      // 4c. Talabalarni biriktirish (max_student limitini hurmat qilamiz)
      let studentsAdded = 0;
      if (studentIds.length > 0) {
        const toAdd = studentIds.slice(0, payload.max_student);
        const validStudents = await tx.user.findMany({
          where: { id: { in: toAdd }, role: Role.STUDENT },
          select: { id: true },
        });
        const validIds = validStudents.map((s) => s.id);
        const { count } = await tx.studentGroup.createMany({
          data: validIds.map((uid) => ({ user_id: uid, group_id: newGroup.id })),
          skipDuplicates: true,
        });
        studentsAdded = count;
      }

      return { newGroup, teachersAdded, studentsAdded };
    });

    return {
      success: true,
      message: 'Guruh muvaffaqiyatli yaratildi',
      group_id: result.newGroup.id,
      teachers_added: result.teachersAdded,
      students_added: result.studentsAdded,
    };
  }


  async getGroupsByTeacherId(teacherId: number) {
    const checkTeacher = await this.prisma.user.findFirst({
      where: {
        id: teacherId,
        role: Role.TEACHER,
        status: Status.active
      }
    });

    if (!checkTeacher) {
      throw new NotFoundException("Bunday o'qituvchi topilmadi");
    }

    const groups = await this.prisma.teacherGroup.findMany({
      where: {
        user_id: teacherId,
        status: Status.active
      },
      select: {
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            max_student: true,
            start_date: true,
            week_day: true,
            start_time: true,
            courses: {
              select: {
                name: true,
                duration_month: true,
                duration_hours: true,
              }
            },
            rooms: {
              select: {
                name: true,
                capacity: true,
              }
            },
          }
        }
      }
    });

    return groups;
  }

  async getGroupDataByStudentId(studentId: number, currentUser: any) {
    const checkStudent = await this.prisma.user.findFirst({
      where: { id: studentId },
    });

    if (!checkStudent) {
      throw new NotFoundException("Student topilmadi");
    }

    const studentGroup = await this.prisma.studentGroup.findFirst({
      where: {
        user_id: studentId
      },
      select: {
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            max_student: true,
            start_date: true,
            teacherGroups: {
              select: {
                users: {
                  select: {
                    first_name: true,
                    last_name: true
                  }
                }
              }
            },
            courses: {
              select: {
                name: true,
                duration_month: true,
                duration_hours: true,
              }
            }
          }
        }
      }
    });

    if (!studentGroup) {
      throw new NotFoundException("Student guruhda topilmadi");
    }

    return studentGroup;
  }

  async findStudentsByGroupId(groupId: number) {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId },
      include: {
        studentGroups: {
          select: {
            id: true,
            status: true,
            users: {
              select: { id: true, first_name: true, last_name: true, photo: true }
            }
          }
        }
      }
    });

    if (!group) {
      throw new NotFoundException("Guruh topilmadi");
    }

    // Faol studentlarni qaytaramiz (har bir studentGroup → user)
    return {
      group_id: group.id,
      group_name: group.name,
      students: group.studentGroups.map(sg => ({
        student_group_id: sg.id,
        id: sg.users.id,
        first_name: sg.users.first_name,
        last_name: sg.users.last_name,
        full_name: `${sg.users.first_name} ${sg.users.last_name}`.trim(),
        photo: sg.users.photo,
        status: sg.status
      }))
    };
  }

  async getAttendanceHistory(groupId: number) {
    const lessons = await this.prisma.lessons.findMany({
      where: { group_id: groupId },
      include: {
        attendances: true
      },
      orderBy: { created_at: 'asc' }
    });
    return lessons;
  }

  // Guruh uchun ma'lum bir sanadagi attendance ni olish
  async getAttendanceForDate(groupId: number, date: string) {
    // Avval guruh uchun shu sanada yaratilgan lessonlarni topamiz
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const lessons = await this.prisma.lessons.findMany({
      where: {
        group_id: groupId,
        created_at: {
          gte: targetDate,
          lt: nextDate
        }
      },
      include: {
        attendances: {
          select: {
            id: true,
            student_id: true,
            isPresent: true
          }
        }
      }
    });

    return {
      date,
      lessons: lessons.map(l => ({
        lesson_id: l.id,
        topic: l.topic,
        description: l.description,
        created_at: l.created_at,
        attendances: l.attendances
      }))
    };
  }

  async findAll(search: filterGroupDto, currentUser?: any) {
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

    const groups = await this.prisma.group.findMany({
      where,
      include: {
        courses: true,
        rooms: true,
        teacherGroups: {
          where: { status: 'active' },
          select: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                photo: true,
                role: true,
              }
            }
          }
        },
        studentGroups: {
          where: { status: 'active' },
          select: {
            id: true,
            users: {
              select: { id: true, first_name: true, last_name: true, photo: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Har bir guruh uchun TeacherGroups ichidan TEACHER rolga ega o'qituvchini ajratib olish
    return groups.map((g) => {
      const teacher = g.teacherGroups?.find((tg) => tg.users?.role === 'TEACHER')?.users || null;
      const { teacherGroups, ...rest } = g;
      return {
        ...rest,
        teacher,
        createdBy: currentUser
          ? {
            id: currentUser.id,
            first_name: currentUser.first_name,
            role: currentUser.role,
          }
          : null,
      };
    });
  }

  async findArxiv(currentUser?: any) {
    const groups = await this.prisma.group.findMany({
      where: { status: GroupStatus.completed },
      include: {
        courses: true,
        rooms: true,
        teacherGroups: {
          where: { status: 'active' },
          select: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                photo: true,
                role: true,
              }
            }
          }
        },
        studentGroups: {
          where: { status: 'active' },
          select: {
            id: true,
            users: {
              select: { id: true, first_name: true, last_name: true, photo: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return groups.map((g) => {
      const teacher = g.teacherGroups?.find((tg) => tg.users?.role === 'TEACHER')?.users || null;
      const { teacherGroups, ...rest } = g;
      return {
        ...rest,
        teacher,
        createdBy: currentUser
          ? {
            id: currentUser.id,
            first_name: currentUser.first_name,
            role: currentUser.role,
          }
          : null,
      };
    });
  }

  async findOne(id: number, currentUser?: any) {
    const group = await this.prisma.group.findFirst({
      where: { id },
      include: {
        courses: true,
        rooms: true,
        teacherGroups: {
          where: { status: 'active' },
          select: {
            users: {
              select: { id: true, first_name: true, last_name: true, photo: true, role: true }
            }
          }
        },
        studentGroups: {
          where: { status: 'active' },
          select: {
            id: true,
            users: {
              select: { id: true, first_name: true, last_name: true, photo: true }
            }
          }
        }
      }
    })

    if (!group) throw new NotFoundException("Guruh mavjud emas yoki inactive")

    // O'qituvchini TeacherGroups ichidan TEACHER rolga ega bo'lgan birinchi userni olish
    const teacher = group.teacherGroups?.find(tg => tg.users?.role === 'TEACHER')?.users;

    // "Kim tomonidan kiritilgan" uchun requestdan kelgan userni qo'shib qaytaramiz
    return {
      ...group,
      teacher,
      createdBy: currentUser
        ? {
          id: currentUser.id,
          first_name: currentUser.first_name,
          role: currentUser.role,
        }
        : null,
    };
  }

  async getLessonsByGroupId(id: number, currentUser?: any) {
    const group = await this.prisma.group.findFirst({
      where: { id },
      select: {
        lessons: {
          select: {
            id: true,
            topic: true,
            created_at: true,
            description: true,
            video: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!group) throw new NotFoundException("Guruh mavjud emas");

    const lessonsWithHomeworkDetails = await Promise.all(
      group.lessons.map(async (lesson) => {
        // Find if there is homework for this lesson
        const homework = await this.prisma.homework.findFirst({
          where: { lesson_id: lesson.id },
          include: {
            homeworkAnswerStudents: {
              where: { user_id: currentUser?.id || -1 },
              include: {
                homeworkResults: {
                  orderBy: { created_at: 'desc' },
                  take: 1,
                },
              },
            },
          },
        });

        let homeworkStatus = 'Berilmagan';
        let deadline: string | null = null;

        if (homework) {
          // deadline: homework.created_at + 20 hours
          const deadlineDate = new Date(homework.created_at);
          deadlineDate.setHours(deadlineDate.getHours() + 20);
          deadline = deadlineDate.toISOString();

          const studentAnswer = homework.homeworkAnswerStudents?.[0];
          if (!studentAnswer) {
            homeworkStatus = 'Bajarilmagan';
          } else {
            if (studentAnswer.status === 'PENDING') {
              homeworkStatus = 'Kutayotgan';
            } else {
              const latestResult = studentAnswer.homeworkResults?.[0];
              if (latestResult) {
                if (latestResult.score >= 60) {
                  homeworkStatus = 'Qabul qilingan';
                } else {
                  homeworkStatus = 'Qaytarilgan';
                }
              } else {
                if (studentAnswer.status === 'CHECKED') {
                  homeworkStatus = 'Qabul qilingan';
                } else if (studentAnswer.status === 'INCOMPLETE' || studentAnswer.status === 'REJECTED') {
                  homeworkStatus = 'Qaytarilgan';
                } else {
                  homeworkStatus = 'Kutayotgan';
                }
              }
            }
          }
        }

        return {
          id: lesson.id,
          topic: lesson.topic,
          description: lesson.description,
          created_at: lesson.created_at,
          videoCount: lesson.video ? 1 : 0,
          video: lesson.video,
          homeworkStatus,
          deadline,
        };
      })
    );

    return lessonsWithHomeworkDetails;
  }


  async getParameters(id: number, currentUser?: any) {
    const group = await this.prisma.group.findFirst({
      where: { id },
      include: {
        courses: true,
        studentGroups: {
          where: { status: 'active' }
        },
        teacherGroups: {
          where: { status: 'active' },
          select: {
            users: {
              select: { id: true, first_name: true, last_name: true, role: true }
            }
          }
        }
      }
    });

    if (!group) throw new NotFoundException("Guruh mavjud emas");

    // TeacherGroups ichidan TEACHER roliga ega o'qituvchini olish
    const teacherUser = group.teacherGroups?.find(tg => tg.users?.role === 'TEACHER')?.users;
    const teacherName = teacherUser
      ? `${teacherUser.last_name} ${teacherUser.first_name}`.trim()
      : "Biriktirilmagan";

    // Kim tomonidan kiritilgan - request userni olish
    const createdByName = currentUser?.first_name
      ? `${currentUser.first_name}${currentUser.role ? ` (${currentUser.role})` : ''}`
      : "Noma'lum";

    // week_day ni har ikkala formatda qaytaramiz (massiv + to'liq nomlar)
    const dayFullMap: Record<string, string> = {
      MONDAY: "Dushanba",
      TUESDAY: "Seshanba",
      WEDNESDAY: "Chorshanba",
      THURSDAY: "Payshanba",
      FRIDAY: "Juma",
      SATURDAY: "Shanba",
      SUNDAY: "Yakshanba"
    };
    const weekDayArr = Array.isArray(group.week_day) ? group.week_day : (group.week_day ? [group.week_day] : []);
    const weekDayFull = weekDayArr.map(d => dayFullMap[d as string] || d).join(", ");

    return {
      branch: "Chilonzor",
      course_name: group.courses?.name || "Noma'lum",
      type: "BOOTCAMP",
      category: "Programming",
      teacher: teacherName,
      created_by: createdByName,
      payment_type: "oyma-oy",
      average_age: "25",
      capacity: group.max_student || 19,
      current_students: group.studentGroups.length,
      contracts: group.studentGroups.length,
      lessons_per_month: 20,
      course_duration_months: group.courses?.duration_month || 8.0,
      total_lessons: group.courses?.duration_hours ? Math.round(group.courses.duration_hours / 1.5) : 160,
      week_day: weekDayArr,
      week_day_full: weekDayFull,
    };
  }

  async getSchedule(id: number) {
    const group = await this.prisma.group.findFirst({
      where: { id },
      include: {
        courses: true,
        rooms: true,
        teacherGroups: {
          where: { status: 'active' },
          select: {
            users: {
              select: { id: true, first_name: true, last_name: true, role: true }
            }
          }
        }
      }
    });

    if (!group) throw new NotFoundException("Guruh mavjud emas");

    const daysMap: Record<string, string> = {
      MONDAY: "Du",
      TUESDAY: "Se",
      WEDNESDAY: "Ch",
      THURSDAY: "Pa",
      FRIDAY: "Ju",
      SATURDAY: "Sh",
      SUNDAY: "Ya"
    };

    const dayFullMap: Record<string, string> = {
      MONDAY: "Dushanba",
      TUESDAY: "Seshanba",
      WEDNESDAY: "Chorshanba",
      THURSDAY: "Payshanba",
      FRIDAY: "Juma",
      SATURDAY: "Shanba",
      SUNDAY: "Yakshanba"
    };

    let daysStr = "";
    if (Array.isArray(group.week_day)) {
      daysStr = group.week_day.map(d => daysMap[d as string] || d).join("/");
    }

    const timeToMinutes = (time: string) => {
      if (!time) return 0;
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    let timeStr = group.start_time || "Noma'lum";
    let startTimeStr = group.start_time || "09:00";
    let endTimeStr = "";
    if (group.start_time && group.courses?.duration_hours) {
      const startMins = timeToMinutes(group.start_time);
      const endMins = startMins + Math.round(group.courses.duration_hours * 60);
      timeStr = `${group.start_time} dan - ${minutesToTime(endMins)} gacha`;
      endTimeStr = minutesToTime(endMins);
    }

    const roomStr = group.rooms ? `${group.rooms.name} // ${group.rooms.capacity}` : "Noma'lum";

    // Kurs davomiyligi (oylarda)
    const totalMonths = group.courses?.duration_month ? Math.round(group.courses.duration_month) : 1;
    const monthNames = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

    // Har bir o'quv oyi uchun alohida qator yaratamiz
    const schedule: any[] = [];

    // O'qituvchini aniqlash (TEACHER roliga ega)
    const teacherUser = group.teacherGroups?.find(tg => tg.users?.role === 'TEACHER')?.users;
    const teacherName = teacherUser
      ? `${teacherUser.last_name} ${teacherUser.first_name}`.trim()
      : "Biriktirilmagan";
    const assistantUser = group.teacherGroups?.find(tg => tg.users?.role === 'ASSISTANT')?.users;
    const assistantName = assistantUser
      ? `${assistantUser.last_name} ${assistantUser.first_name}`.trim()
      : null;

    if (group.start_date) {
      try {
        const startDate = new Date(group.start_date);
        // Har bir o'quv oyi uchun
        for (let i = 0; i < totalMonths; i++) {
          const monthStart = new Date(startDate);
          monthStart.setMonth(monthStart.getMonth() + i);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(monthEnd.getDate() - 1);

          // Shu oy ichidagi dars sanalarini hisoblash (week_day ga ko'ra)
          const lessonDates: string[] = [];
          if (Array.isArray(group.week_day)) {
            const cursor = new Date(monthStart);
            while (cursor <= monthEnd) {
              const dayKey = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][cursor.getDay()];
              if (group.week_day.includes(dayKey)) {
                lessonDates.push(cursor.toISOString().split("T")[0]);
              }
              cursor.setDate(cursor.getDate() + 1);
            }
          }

          const rangeStr = `${monthStart.getDate()} ${monthNames[monthStart.getMonth()]} - ${monthEnd.getDate()} ${monthNames[monthEnd.getMonth()]}, ${monthEnd.getFullYear()}`;

          schedule.push({
            month_number: i + 1,
            month_label: `${i + 1}-o'quv oyi`,
            month_name: monthNames[monthStart.getMonth()],
            year: monthStart.getFullYear(),
            name: teacherName,
            assistant: assistantName,
            days: daysStr,
            days_full: Array.isArray(group.week_day) ? group.week_day.map(d => dayFullMap[d as string] || d).join(", ") : "",
            time: timeStr,
            start_time: startTimeStr,
            end_time: endTimeStr,
            range: rangeStr,
            start_date: monthStart.toISOString().split("T")[0],
            end_date: monthEnd.toISOString().split("T")[0],
            lessons_count: lessonDates.length,
            lesson_dates: lessonDates,
            room: roomStr,
          });
        }
      } catch (e) {
        // start_date parse xato bo'lsa, bitta qator qaytaramiz
        schedule.push({
          month_number: 1,
          month_label: "1-o'quv oyi",
          name: teacherName,
          days: daysStr,
          time: timeStr,
          range: group.start_date,
          room: roomStr,
        });
      }
    } else {
      // start_date yo'q bo'lsa
      schedule.push({
        month_number: 1,
        month_label: "1-o'quv oyi",
        name: teacherName,
        days: daysStr,
        time: timeStr,
        range: "Noma'lum",
        room: roomStr,
      });
    }

    return schedule;
  }


  async update(id: number, updateGroupDto: UpdateGroupDto) {
    // Avval guruh mavjudligini tekshiramiz
    await this.findOne(id);

    // week_day massiv yoki string bo'lishi mumkin
    const data: any = { ...updateGroupDto };
    if (data.week_day !== undefined) {
      data.week_day = Array.isArray(data.week_day) ? data.week_day : [data.week_day];
    }

    await this.prisma.group.update({
      where: { id },
      data
    });

    return {
      success: true,
      message: "Guruh muvaffaqiyatli yangilandi"
    }
  }

  async remove(id: number) {
    // Avval guruh mavjudligini tekshiramiz
    await this.findOne(id);

    await this.prisma.group.update({
      where: { id },
      data: { status: GroupStatus.completed }
    });

    return {
      success: true,
      message: "Guruh arxivga ko'chirildi"
    }
  }
}



