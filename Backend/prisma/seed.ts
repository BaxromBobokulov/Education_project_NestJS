import 'dotenv/config'
import * as bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Prisma 7.x — schema da url ko'rsatilmaydi, adapter orqali beramiz
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma  = new PrismaClient({ adapter })


async function main() {
  const password_env = process.env.SUPER_ADMIN_PASSWORD
  if (!password_env) {
    console.error('❌  SUPER_ADMIN_PASSWORD .env faylida yo\'q!')
    process.exit(1)
  }

  console.log('🌱  Seeding boshlandi...')

  const hash = await bcrypt.hash(password_env, 10)

  // ── SuperAdmin ─────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where:  { email: 'superadmin@example.com' },
    update: {},
    create: {
      first_name: 'Super',
      last_name:  'Admin',
      password:   hash,
      role:       'SUPERADMIN',
      phone:      '1234567890',
      email:      'superadmin@example.com',
      address:    'Toshkent shahri',
    },
  })
  console.log(`✅  SuperAdmin: ${superAdmin.email}`)

  // ── Admin ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin123', 10)
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@example.com' },
    update: {},
    create: {
      first_name: 'Admin',
      last_name:  'User',
      password:   adminHash,
      role:       'ADMIN',
      phone:      '9876543210',
      email:      'admin@example.com',
      address:    'Toshkent shahri',
    },
  })
  console.log(`✅  Admin: ${admin.email}`)

  // ── Teacher ────────────────────────────────────────────────────────────
  const teacherHash = await bcrypt.hash('Teacher123', 10)
  const teacher = await prisma.user.upsert({
    where:  { email: 'teacher@example.com' },
    update: {},
    create: {
      first_name: 'Otabek',
      last_name:  'Yusupov',
      password:   teacherHash,
      role:       'TEACHER',
      phone:      '9001112233',
      email:      'teacher@example.com',
      address:    'Toshkent shahri',
    },
  })
  console.log(`✅  Teacher: ${teacher.email}`)

  // ── Student ────────────────────────────────────────────────────────────
  const studentHash = await bcrypt.hash('Student123', 10)
  const student = await prisma.user.upsert({
    where:  { email: 'student@example.com' },
    update: {},
    create: {
      first_name: 'Nosirxon',
      last_name:  'Ziyovutdinov',
      password:   studentHash,
      role:       'STUDENT',
      phone:      '9112223344',
      email:      'student@example.com',
      address:    'Toshkent shahri',
    },
  })
  console.log(`✅  Student: ${student.email}`)

  // ── Course ─────────────────────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where:  { name: 'Backend Development' },
    update: {},
    create: {
      name:           'Backend Development',
      description:    'NestJS, PostgreSQL, Prisma bilan backend dasturlash',
      price:          1500000,
      duration_month: 6,
      duration_hours: 180,
      color:          '#7c3aed',
    },
  })
  console.log(`✅  Course: ${course.name}`)

  // ── Room ───────────────────────────────────────────────────────────────
  const room = await prisma.room.upsert({
    where:  { name: '101-xona' },
    update: {},
    create: {
      name:     '101-xona',
      capacity: 20,
    },
  })
  console.log(`✅  Room: ${room.name}`)

  // ── Group ──────────────────────────────────────────────────────────────
  const group = await prisma.group.upsert({
    where:  { name: 'Backend-N1' },
    update: {},
    create: {
      name:        'Backend-N1',
      description: 'Backend dasturlash kursi 1-guruh',
      course_id:   course.id,
      room_id:     room.id,
      start_date:  '2026-01-01',
      week_day:    ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
      start_time:  '09:00',
      max_student: 20,
      status:      'active',
    },
  })
  console.log(`✅  Group: ${group.name}`)

  // ── TeacherGroup ───────────────────────────────────────────────────────
  await prisma.teacherGroup.upsert({
    where:  { user_id_group_id: { user_id: teacher.id, group_id: group.id } },
    update: {},
    create: { user_id: teacher.id, group_id: group.id },
  })
  console.log(`✅  TeacherGroup: ${teacher.first_name} → ${group.name}`)

  // ── StudentGroup ───────────────────────────────────────────────────────
  await prisma.studentGroup.upsert({
    where:  { user_id_group_id: { user_id: student.id, group_id: group.id } },
    update: {},
    create: { user_id: student.id, group_id: group.id },
  })
  console.log(`✅  StudentGroup: ${student.first_name} → ${group.name}`)

  // ── Lesson ─────────────────────────────────────────────────────────────
  const lesson = await prisma.lessons.create({
    data: {
      group_id:    group.id,
      user_id:     teacher.id,
      topic:       '1-dars: NestJS kirish',
      description: 'NestJS asoslari va arxitektura',
    },
  })
  console.log(`✅  Lesson: ${lesson.topic}`)

  // ── Homework ───────────────────────────────────────────────────────────
  const homework = await prisma.homework.create({
    data: {
      group_id:   group.id,
      user_id:    teacher.id,
      lesson_id:  lesson.id,
      title:      '1-uyga vazifa: NestJS module yarating',
    },
  })
  console.log(`✅  Homework: ${homework.title}`)

  console.log('\n🎉  Seeding muvaffaqiyatli yakunlandi!')
  console.log('─────────────────────────────────────')
  console.log(`SuperAdmin: superadmin@example.com / ${password_env}`)
  console.log(`Admin:      admin@example.com       / Admin123`)
  console.log(`Teacher:    teacher@example.com     / Teacher123`)
  console.log(`Student:    student@example.com     / Student123`)
}

main()
  .catch(e => {
    console.error('❌  Seed xatoligi:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })