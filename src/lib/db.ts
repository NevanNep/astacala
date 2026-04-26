import path from 'path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@/src/generated/prisma/client'

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
  const url = `file:${path.resolve(rawUrl.replace('file:', ''))}`
  const adapter = new PrismaLibSql({ url })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
