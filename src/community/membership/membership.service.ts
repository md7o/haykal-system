import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(Membership)
    private readonly repository: Repository<Membership>,
  ) {}

  async create(userId: string, dto: CreateMembershipDto): Promise<Membership> {
    const status = this.repository.create({
      ...dto,
      userId,
    });
    return await this.repository.save(status);
  }

  async findAllByUser(userId: string): Promise<Membership[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Membership | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateMembershipDto): Promise<Membership> {
    const status = await this.findOne(id);
    if (!status) throw new NotFoundException('User status not found');

    Object.assign(status, dto);
    return await this.repository.save(status);
  }

  async remove(id: string): Promise<{ affected?: number }> {
    const result = await this.repository.delete(id);
    return { affected: result.affected ?? undefined };
  }
}
