// src/lib/prisma.ts
import 'dotenv/config'
import { PrismaClient } from '@/generated/client/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

declare global {
var __prisma: PrismaClient | undefined
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)

export const prisma: PrismaClient =
global.__prisma ??
new PrismaClient({
adapter,
})

if (process.env.NODE_ENV !== "production") {
global.__prisma = prisma
}