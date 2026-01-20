import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

    return await this.repository.save(membership);
  }

  async findAll(): Promise<Membership[]> {
    return await this.repository.find({
      order: { joinedAt: 'DESC' },
    });
  }

  async findAllByUser(userId: string): Promise<Membership[]> {
    return await this.repository.find({
      where: { userId },
      order: { joinedAt: 'DESC' },
    });
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
    return await this.repository.save(membership);
  }

  async remove(id: string): Promise<{ affected?: number }> {
    const result = await this.repository.delete(id);
    return { affected: result.affected ?? undefined };
  }
}
