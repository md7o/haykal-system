import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { Membership } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { User } from 'src/user/entities/user.entity';
import { redis } from 'src/common/redis/redis.provider';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.redis = redis;
  }

  private redis = redis;

  async create(userId: string, communityId: string, dto: CreateMembershipDto): Promise<Membership> {
    // Fetch user to get username
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const membership = this.repository.create({
      ...dto,
      userId,
      communityId,
      authorName: user.username,
    });

    // user cannot make more than one membership in the same community
    const existingMembership = await this.repository.findOne({
      where: { userId, communityId },
    });
    if (existingMembership) {
      throw new NotFoundException('Membership already exists in this community');
    }

    const result = await this.repository.save(membership);

    // Invalidate user's membership cache
    await this.redis.del(`membership:user:${userId}`);

    return result;
  }

  async findAll(): Promise<Membership[]> {
    return await this.repository.find({
      order: { joinedAt: 'DESC' },
    });
  }

  async findAllByUser(userId: string): Promise<Membership[]> {
    const cacheKey = `membership:user:${userId}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed;
      }
    } catch (error) {
      console.error(`❌ [REDIS ERROR - GET] ${error.message}`);
    }

    const memberships = await this.repository.find({
      where: { userId },
      order: { joinedAt: 'DESC' },
    });

    // Convert to plain objects and cache
    try {
      const plainObjects = instanceToPlain(memberships);
      const serialized = JSON.stringify(plainObjects);
      await this.redis.set(cacheKey, serialized, 'EX', 60 * 60);
    } catch (error) {
      console.error(`❌ [REDIS ERROR - SET] Failed to cache: ${error.message}`);
    }

    return memberships;
  }

  async findByUserAndCommunity(userId: string, communityId: string): Promise<Membership[]> {
    return await this.repository.find({
      where: { userId, communityId },
      order: { joinedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Membership | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateMembershipDto): Promise<Membership> {
    const membership = await this.findOne(id);
    if (!membership) throw new NotFoundException('User status not found');

    Object.assign(membership, dto);
    const result = await this.repository.save(membership);

    // Invalidate user's membership cache
    await this.redis.del(`membership:user:${membership.userId}`);

    return result;
  }

  async remove(id: string): Promise<{ affected?: number }> {
    const membership = await this.findOne(id);
    if (membership) {
      // Invalidate user's membership cache before deletion
      await this.redis.del(`membership:user:${membership.userId}`);
    }

    const result = await this.repository.delete(id);
    return { affected: result.affected ?? undefined };
  }
}
