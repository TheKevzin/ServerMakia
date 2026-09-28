import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminUsername = 'admin'
  const adminPassword = process.env.MASTER_PASSWORD || 'enderlab'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username: adminUsername,
        name: 'Administrator',
        password: hashedPassword,
        role: 'ADMIN',
      }
    })
    console.log('✅ Default ADMIN user created: admin /', adminPassword)
  } else {
    console.log('ℹ️ ADMIN user already exists.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
