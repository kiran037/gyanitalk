// // src/lib/prisma.ts
// import 'dotenv/config'
// import { PrismaClient } from '@/generated/client/client'
// import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// declare global {
// var __prisma: PrismaClient | undefined
// }

// const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)

// export const prisma: PrismaClient =
// global.__prisma ??
// new PrismaClient({
// adapter,
// })

// if (process.env.NODE_ENV !== "production") {
// global.__prisma = prisma
// }


// src/lib/prisma.ts
import 'dotenv/config'
import { PrismaClient } from '@/generated/client/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

declare global {
  var __prisma: PrismaClient | undefined
  var __adapter: PrismaMariaDb | undefined
}

// Parse your DATABASE_URL to extract connection details
const parseConnectionString = (url: string) => {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/)
  if (!match) throw new Error('Invalid DATABASE_URL format')
  
  return {
    user: decodeURIComponent(match[1]),
    password: decodeURIComponent(match[2]),
    host: match[3],
    port: parseInt(match[4]),
    database: match[5]
  }
}

const connectionConfig = parseConnectionString(process.env.DATABASE_URL!)

// Cache adapter globally to prevent multiple connection pools
const adapter = global.__adapter ?? new PrismaMariaDb({
  host: connectionConfig.host,
  port: connectionConfig.port,
  user: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  connectionLimit: 5,
  connectTimeout: 30000,
})

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma
  global.__adapter = adapter
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})