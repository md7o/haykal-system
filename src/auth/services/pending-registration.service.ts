import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { redis } from 'src/common/redis/redis.provider';

export interface PendingUserData {
  email: string;
  username: string;
  password: string;
  code: string;
  createdAt: number;
}

@Injectable()
export class PendingRegistrationService {
  private readonly redisKeyPrefix = 'pending_user:';
  private readonly ttlSeconds = 15 * 60; // 15 minutes

  /**
   * Create a pending registration with a UUID token
   * Returns the verification token to be used in the verification link
   */
  async createPendingRegistration(input: {
    email: string;
    username: string;
    password: string;
    code: string;
    expiresAt: Date;
  }): Promise<{ token: string }> {
    const token = uuidv4();
    const key = `${this.redisKeyPrefix}${token}`;

    const userData: PendingUserData = {
      email: input.email,
      username: input.username,
      password: input.password,
      code: input.code,
      createdAt: Date.now(),
    };

    await redis.setex(key, this.ttlSeconds, JSON.stringify(userData));
    return { token };
  }

  /**
   * Find a pending registration by verification token
   */
  async findByToken(token: string): Promise<PendingUserData | null> {
    const key = `${this.redisKeyPrefix}${token}`;
    const data = await redis.get(key);

    if (!data) return null;

    try {
      return JSON.parse(data) as PendingUserData;
    } catch {
      return null;
    }
  }

  /**
   * Find pending registration by email and code (for backward compatibility with OTP verification)
   */
  async findValidCode(email: string, code: string): Promise<PendingUserData | null> {
    // Scan all pending_user:* keys in Redis
    const pattern = `${this.redisKeyPrefix}*`;
    const keys = await redis.keys(pattern);

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        try {
          const parsed = JSON.parse(data) as PendingUserData;
          if (parsed.email === email && parsed.code === code) {
            return parsed;
          }
        } catch {
          // Continue if parsing fails
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Find the latest pending registration for a given email or username
   */
  async findLatestPending(email: string, username: string): Promise<PendingUserData | null> {
    const pattern = `${this.redisKeyPrefix}*`;
    const keys = await redis.keys(pattern);

    let latest: PendingUserData | null = null;
    let latestTime = 0;

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        try {
          const parsed = JSON.parse(data) as PendingUserData;
          if ((parsed.email === email || parsed.username === username) && parsed.createdAt > latestTime) {
            latest = parsed;
            latestTime = parsed.createdAt;
          }
        } catch {
          // Continue if parsing fails
          continue;
        }
      }
    }

    return latest;
  }

  /**
   * Delete a pending registration by token
   */
  async deleteByToken(token: string): Promise<void> {
    const key = `${this.redisKeyPrefix}${token}`;
    await redis.del(key);
  }
}
