import { Injectable } from '@nestjs/common';
import { redis } from 'src/common/redis/redis.provider';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

@Injectable()
export class RefreshTokenService {
  /**
   * Create and store a refresh token in Redis
   * Key format: refresh_token:${tokenHash}
   * Value: userId
   * Also maintains user_tokens:${userId} set for session management
   */
  async createRefreshToken(userId: string, token: string, maxSessions = 3): Promise<{ userId: string; token: string }> {
    // Get all tokens for this user
    const userTokensKey = `user_tokens:${userId}`;
    const tokenCount = await redis.scard(userTokensKey);

    // If at max sessions, remove oldest tokens
    if (tokenCount >= maxSessions) {
      const tokensToRemove = tokenCount - maxSessions + 1;
      const oldTokens = await redis.smembers(userTokensKey);

      for (let i = 0; i < tokensToRemove && i < oldTokens.length; i++) {
        await redis.del(`refresh_token:${oldTokens[i]}`);
        await redis.srem(userTokensKey, oldTokens[i]);
      }
    }

    // Store token in Redis with TTL
    await redis.setex(`refresh_token:${token}`, REFRESH_TOKEN_TTL, userId);

    // Add token to user's token set
    await redis.sadd(userTokensKey, token);
    await redis.expire(userTokensKey, REFRESH_TOKEN_TTL);

    return { userId, token };
  }

  /**
   * Find and validate a refresh token
   */
  async findToken(userId: string, token: string): Promise<{ userId: string } | null> {
    const storedUserId = await redis.get(`refresh_token:${token}`);

    if (storedUserId && storedUserId === userId) {
      return { userId: storedUserId };
    }

    return null;
  }

  /**
   * Delete a specific refresh token
   */
  async deleteRefreshToken(userId: string, token: string): Promise<void> {
    await redis.del(`refresh_token:${token}`);
    await redis.srem(`user_tokens:${userId}`, token);
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeTokens(userId: string): Promise<void> {
    const userTokensKey = `user_tokens:${userId}`;
    const tokens = await redis.smembers(userTokensKey);

    for (const token of tokens) {
      await redis.del(`refresh_token:${token}`);
    }

    await redis.del(userTokensKey);
  }

  /**
   * Save a token (used during sign-in)
   */
  async saveToken(tokenData: {
    userId: string;
    token: string;
    deviceInfo?: string;
    accessTokenExpiresAt?: number;
  }): Promise<void> {
    const { userId, token } = tokenData;

    // Store token in Redis with TTL
    await redis.setex(`refresh_token:${token}`, REFRESH_TOKEN_TTL, userId);

    // Add token to user's token set
    const userTokensKey = `user_tokens:${userId}`;
    await redis.sadd(userTokensKey, token);
    await redis.expire(userTokensKey, REFRESH_TOKEN_TTL);
  }
}
