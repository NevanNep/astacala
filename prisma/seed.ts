import 'dotenv/config'
import path from 'path'
import bcrypt from 'bcryptjs'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client'

const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const url = `file:${path.resolve(rawUrl.replace('file:', ''))}`
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashed = await bcrypt.hash('password123', 10)

  await prisma.user.upsert({
    where: { email: 'relawan@astacala.org' },
    update: {},
    create: { email: 'relawan@astacala.org', password: hashed },
  })

  console.log('Seed complete: relawan@astacala.org / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
