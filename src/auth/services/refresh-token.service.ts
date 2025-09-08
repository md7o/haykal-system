import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from 'src/user/entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createRefreshToken(
    userId: string,
    token: string,
    deviceInfo?: string,
    maxSessions = 3,
    accessTokenExpiresAt?: number,
  ): Promise<RefreshToken> {
    const tokens = await this.refreshTokenRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    if (tokens.length >= maxSessions) {
      const toDelete = tokens.slice(0, tokens.length - maxSessions + 1);
      for (const t of toDelete) {
        await this.refreshTokenRepository.delete(t.id);
      }
    }

    const hashedToken = await bcrypt.hash(token, 10);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token: hashedToken,
      deviceInfo,
      accessTokenExpiresAt: accessTokenExpiresAt
        ? String(accessTokenExpiresAt)
        : null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return this.refreshTokenRepository.save(refreshToken);
  }

  async findToken(userId: string, token: string): Promise<RefreshToken | null> {
    const storedTokens = await this.refreshTokenRepository.find({
      where: { userId },
    });

    for (const stored of storedTokens) {
      const isMatch = await bcrypt.compare(token, stored.token);
      if (isMatch) {
        return stored;
      }
    }

    return null;
  }

  async deleteRefreshToken(userId: string, token: string): Promise<void> {
    const stored = await this.findToken(userId, token);
    if (stored) {
      await this.refreshTokenRepository.delete(stored.id);
    }
  }

  async revokeTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.delete({ userId });
  }

  async saveToken(tokenData: {
    userId: string;
    token: string;
    deviceInfo?: string;
    accessTokenExpiresAt?: number;
  }): Promise<void> {
    const { userId, token, deviceInfo, accessTokenExpiresAt } = tokenData;

    const hashedToken = await bcrypt.hash(token, 10);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token: hashedToken,
      deviceInfo,
      accessTokenExpiresAt: accessTokenExpiresAt
        ? String(accessTokenExpiresAt)
        : null,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }
}
