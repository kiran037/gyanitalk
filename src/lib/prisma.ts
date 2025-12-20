// // src/lib/prisma.ts
// import { PrismaClient } from "@prisma/client";

// declare global {
//   // allow a global reference in dev to avoid creating multiple PrismaClient instances
//   // eslint-disable-next-line no-var
//   var __prisma: PrismaClient | undefined;
// }

// // Use global __prisma to avoid creating many instances during HMR in development
// export const prisma: PrismaClient =
//   global.__prisma ??
//   new PrismaClient({
//     // Optional: enable query logging during debugging
//     // log: ["query", "info", "warn", "error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   global.__prisma = prisma;
// }


// src/lib/prisma.ts
import 'dotenv/config'
import { PrismaClient } from '@/generated/client/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

declare global {
  // allow a global reference in dev to avoid creating multiple PrismaClient instances
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// ✅ Create MariaDB adapter (works for MySQL too)
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)

// Use global __prisma to avoid creating many instances during HMR in development
export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    adapter,  // ✅ Pass adapter here
    // Optional: enable query logging during debugging
    // log: ["query", "info", "warn", "error"],
  })

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma
}