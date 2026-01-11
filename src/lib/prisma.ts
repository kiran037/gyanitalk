// src/lib/prisma.ts
import 'dotenv/config'
import { PrismaClient } from '@/generated/client/client' // Your custom path
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { createPool } from 'mariadb' 

declare global {
  var __prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {

  const pool = createPool(process.env.DATABASE_URL!) 
  const adapter = new PrismaMariaDb(pool as any)

  return new PrismaClient({
    adapter,
  })
}

export const prisma = global.__prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma
}