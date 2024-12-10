import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

export class InvalidateRefreshTokenError extends Error {}

@Injectable()
export class TokensRepository {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async create(
    userId: number,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    await this.remove(userId);
    await this.redisClient.lpush(
      this.getKey(userId),
      accessToken,
      refreshToken,
    );
  }

  async getAll(userId: number): Promise<string[]> {
    const tokens = await this.redisClient.lrange(this.getKey(userId), 0, -1);
    return tokens;
  }

  async validate(userId: number, token: string): Promise<boolean> {
    const cachedTokens = await this.getAll(userId);
    if (!cachedTokens.includes(token)) {
      await this.remove(userId);
      throw new InvalidateRefreshTokenError('Token is invalid');
    }

    return true;
  }

  async remove(userId: number): Promise<void> {
    await this.redisClient.del(this.getKey(userId));
  }

  private getKey(userId: number): string {
    return `user-${userId}`;
  }
}
