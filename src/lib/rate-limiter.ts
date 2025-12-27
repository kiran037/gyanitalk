import { prisma } from "@/lib/prisma";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// Using systemflag table to store rate limits
export class RateLimiter {
  private static RATE_LIMIT_PREFIX = "rate_limit_kundli_";
  private static FLAG_GROUP_ID = 1; // exists in your DB

  // 🔹 Read numeric config flags from DB
  private static async getNumberFlag(
    name: string,
    fallback: number
  ): Promise<number> {
    const flag = await prisma.systemflag.findFirst({
      where: {
        name,
        isActive: "1",
        isDelete: "0",
      },
    });

    const value = Number(flag?.value);
    return Number.isFinite(value) ? value : fallback;
  }

  static async checkLimit(
    identifier: string,
    isLoggedIn: boolean
  ): Promise<RateLimitResult> {
    // 🔹 Load limits from DB (you already inserted these)
    const guestLimit = await this.getNumberFlag(
      "kundli_free_guest_limit",
      3
    );
    const userLimit = await this.getNumberFlag(
      "kundli_free_user_limit",
      5
    );

    const maxAttempts = isLoggedIn ? userLimit : guestLimit;
    const flagName = `${this.RATE_LIMIT_PREFIX}${identifier}`;

    const flag = await prisma.systemflag.findFirst({
      where: { name: flagName },
    });

    const now = new Date();
    const resetAt = this.getNextResetTime();

    // 🆕 First attempt
    if (!flag) {
      await prisma.systemflag.create({
        data: {
          name: flagName,
          valueType: "json",
          value: JSON.stringify({
            count: 1,
            resetAt: resetAt.toISOString(),
          }),
          isActive: "1",
          isDelete: "0",
          description: "Rate limit tracking",
          flagGroupId: this.FLAG_GROUP_ID,
        },
      });

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt,
      };
    }

    const data = JSON.parse(
      flag.value || '{"count":0,"resetAt":""}'
    );

    const flagResetAt = new Date(data.resetAt);

    // 🔄 Reset window expired
    if (now >= flagResetAt) {
      await prisma.systemflag.update({
        where: { id: flag.id },
        data: {
          value: JSON.stringify({
            count: 1,
            resetAt: resetAt.toISOString(),
          }),
        },
      });

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt,
      };
    }

    // ⛔ Limit exceeded
    if (data.count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: flagResetAt,
      };
    }

    // ➕ Increment counter
    await prisma.systemflag.update({
      where: { id: flag.id },
      data: {
        value: JSON.stringify({
          count: data.count + 1,
          resetAt: data.resetAt,
        }),
      },
    });

    return {
      allowed: true,
      remaining: maxAttempts - data.count - 1,
      resetAt: flagResetAt,
    };
  }

  // ⏰ Reset at midnight (can be made DB-driven later)
  private static getNextResetTime(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  static async getRemainingAttempts(
    identifier: string,
    isLoggedIn: boolean
  ): Promise<number> {
    const result = await this.checkLimit(identifier, isLoggedIn);
    return result.remaining;
  }
}