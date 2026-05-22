import 'dotenv/config'
import * as bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

  async function main() {
    const password_env = process.env.SUPER_ADMIN_PASSWORD
    if (!password_env) {
      console.error('SUPER_ADMIN_PASSWORD not set. Please add it to .env or set the env var before running the seed.');
      process.exit(1);
    }
    const hash = await bcrypt.hash(password_env, 10)

    await prisma.user.create({
      data: {
        first_name: 'Super',
        last_name: 'Admin',
        password: hash,
        role: "SUPERADMIN",
        phone: '1234567890',
        email: 'superadmin@example.com',
        address: '123 Main St',
        photo: "https://cdn-icons-png.flaticon.com/512/149/149071.png"

      }
    })
  }

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })