import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { HomeworkStatus } from '@prisma/client';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) { }

  // ─── Homework CRUD ────────────────────────────────────────────────────────

  async create(payload: any) {
    const existing = await this.prisma.homework.findUnique({
      where: { lesson_id: +payload.lesson_id },
    });
    if (existing) {
      throw new BadRequestException("Ushbu dars uchun allaqachon uyga vazifa yaratilgan");
    }

    return this.prisma.homework.create({
      data: {
        group_id: +payload.group_id,
        user_id: +payload.user_id,
        lesson_id: +payload.lesson_id,
        title: payload.title,
        file: payload.file || null,
      },
    });
  }

  async findByGroup(groupId: number) {
    return this.prisma.homework.findMany({
      where: { group_id: groupId },
      include: {
        lessons: true,
        homeworkAnswerStudents: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getLessonsByGroup(groupId: number) {
    return this.prisma.lessons.findMany({
      where: { 
        group_id: groupId,
        homework: null,
      },
      select: {
        id: true,
        topic: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Homework Detail (guruh o'quvchilari + javob holati) ──────────────────

  /**
   * GET /homework/:id/detail
   * Guruh bo'yicha barcha talabalar ro'yxati + ularning javob statusi
   * Frontend HomeworkDetail.jsx uchun asosiy endpoint
   */
  async getHomeworkDetail(homeworkId: number) {
    const homework = await this.prisma.homework.findFirst({
      where: { id: homeworkId },
      include: {
        groups: {
          select: {
            id: true,
            name: true,
            studentGroups: {
              where: { status: 'active' },
              select: {
                users: {
                  select: { id: true, first_name: true, last_name: true, photo: true },
                },
              },
            },
          },
        },
        homeworkAnswerStudents: {
          include: {
            homeworkResults: {
              orderBy: { created_at: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!homework) throw new NotFoundException('Homework topilmadi');

    // Barcha talabalar
    const allStudents = homework.groups.studentGroups.map((sg) => sg.users);

    // Talabalarni javob holati bilan boyitamiz
    const students = allStudents.map((student) => {
      const answer = homework.homeworkAnswerStudents.find(
        (a) => a.user_id === student.id,
      );
      const result = answer?.homeworkResults?.[0] || null;

      return {
        user_id: student.id,
        full_name: `${student.first_name} ${student.last_name}`.trim(),
        photo: student.photo,
        answer_id: answer?.id || null,
        answer_title: answer?.title || null,
        answer_file: answer?.file || null,
        status: answer?.status || 'INCOMPLETE',
        score: result?.score ?? null,
        submitted_at: answer?.created_at || null,
      };
    });

    // Tab counters
    const counts = {
      PENDING: students.filter((s) => s.status === 'PENDING').length,
      CHECKED: students.filter((s) => s.status === 'CHECKED').length,
      INCOMPLETE: students.filter((s) => s.status === 'INCOMPLETE').length,
    };

    return {
      homework_id: homework.id,
      title: homework.title,
      file: homework.file,
      group_id: homework.group_id,
      group_name: homework.groups.name,
      created_at: homework.created_at,
      counts,
      students,
    };
  }

  // ─── Homework Answer ──────────────────────────────────────────────────────

  /**
   * POST /homework/answer
   * Talaba homework javobini yuboradi
   */
  async submitAnswer(userId: number, payload: any) {
    // Avval homework mavjudligini tekshiramiz
    const homework = await this.prisma.homework.findFirst({
      where: { id: +payload.homework_id },
    });
    if (!homework) throw new NotFoundException('Homework topilmadi');

    // Talaba avval javob berganmi?
    const existing = await this.prisma.homeworkAnswerStudent.findFirst({
      where: { user_id: userId, homework_id: +payload.homework_id },
    });
    if (existing) throw new BadRequestException('Siz bu homeworkka allaqachon javob yuborgansiz');

    const answer = await this.prisma.homeworkAnswerStudent.create({
      data: {
        user_id: userId,
        homework_id: +payload.homework_id,
        title: payload.title || '',
        file: payload.file || null,
        status: HomeworkStatus.PENDING,
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, photo: true },
        },
      },
    });

    return answer;
  }

  /**
   * GET /homework/:id/answers
   * Homework uchun barcha javoblarni qaytaradi
   */
  async findAnswers(homeworkId: number) {
    return this.prisma.homeworkAnswerStudent.findMany({
      where: { homework_id: homeworkId },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, photo: true },
        },
        homeworkResults: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: {
            checkedByUser: {
              select: { id: true, first_name: true, last_name: true },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * GET /homework/answer/:answerId
   * Aniq bir javobni to'liq ma'lumotlari bilan qaytaradi (HomeworkReview uchun)
   */
  async getAnswerById(answerId: number) {
    const answer = await this.prisma.homeworkAnswerStudent.findFirst({
      where: { id: answerId },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, photo: true },
        },
        homework: {
          select: { id: true, title: true, file: true, group_id: true },
        },
        homeworkResults: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: {
            checkedByUser: {
              select: { id: true, first_name: true, last_name: true },
            },
          },
        },
      },
    });

    if (!answer) throw new NotFoundException('Javob topilmadi');
    return answer;
  }

  // ─── Grade (Ball qo'yish) ─────────────────────────────────────────────────

  /**
   * POST /homework/answer/:answerId/grade
   * O'qituvchi talabaning javobiga ball qo'yadi
   * score >= 60 → CHECKED, score < 60 → INCOMPLETE
   */
  async gradeAnswer(checkerId: number, answerId: number, payload: any) {
    const answer = await this.prisma.homeworkAnswerStudent.findFirst({
      where: { id: answerId },
    });
    if (!answer) throw new NotFoundException('Javob topilmadi');

    const score = +payload.score;
    if (isNaN(score) || score < 0 || score > 100) {
      throw new BadRequestException('Ball 0 dan 100 gacha bo\'lishi kerak');
    }

    const newStatus: HomeworkStatus = score >= 60 ? HomeworkStatus.CHECKED : HomeworkStatus.INCOMPLETE;

    // HomeworkResult yaratish
    const result = await this.prisma.homeworkResult.create({
      data: {
        homework_answer_id: answerId,
        user_id: answer.user_id,
        checked_by: checkerId,
        title: payload.title || `Ball: ${score}`,
        score,
        status: newStatus,
      },
    });

    // HomeworkAnswerStudent statusini yangilash
    await this.prisma.homeworkAnswerStudent.update({
      where: { id: answerId },
      data: { status: newStatus },
    });

    return {
      success: true,
      result,
      status: newStatus,
      message: newStatus === HomeworkStatus.CHECKED
        ? 'Homework qabul qilindi'
        : 'Homework qaytarildi (past ball)',
    };
  }

  async findHomeworksByLesson(lesson_id: number , user_id: number) {
    const Exists_lesson_id = await this.prisma.lessons.findFirst({
      where: { id: lesson_id }
    })
    if (!Exists_lesson_id) {
      throw new BadRequestException("Bunday dars mavjud emas")
    }

    const lesson_detail = await this.prisma.lessons.findFirst({
      where: {
        id: lesson_id,
      },
      select: {
        topic: true,
        description: true,
        video: true,
        homework: {
          select: {
            id: true,
            title: true,
            file: true,
            created_at: true,
            user_id: true,
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                photo: true
              }
            },
            homeworkAnswerStudents: {
              where: {
                user_id: user_id
              },
              select: {
                id: true,
                title: true,
                file: true,
                status: true,
                created_at: true,
                update_at: true,
                user: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    photo: true
                  }
                },
                homeworkResults: {
                  select: {
                    id: true,
                    title: true,
                    score: true,
                    status: true,
                    created_at: true,
                    checked_by: true,
                    checkedByUser: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        photo: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    })
    return lesson_detail;
  }
}
