import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CommunityItem } from './entities/community-items.entity';
import { UpdateCommunityItemsDto } from './dto/update-community-items.dto';
import { MembershipService } from '../membership/membership.service';
import { MembershipType } from '../../common/enums/membership-type';
import { Like } from '../user-activity/entities/like.entity';
import { CreateCommunityItemsDto } from './dto/create-community-items.dto';
import { CommunityItemType } from '../../common/enums/community-item-type';

@Injectable()
export class CommunityItemsService {
  constructor(
    @InjectRepository(CommunityItem)
    private readonly repository: Repository<CommunityItem>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly membershipService: MembershipService,
  ) {}

  async createCommunityItem(userId: string, dto: CreateCommunityItemsDto): Promise<CommunityItem> {
    const statuses = await this.membershipService.findAllByUser(userId);
    const supervisorStatus = statuses.find((s) => s.role === MembershipType.Owner && s.communityId === dto.communityId);

    if (!supervisorStatus) {
      throw new ForbiddenException('Only owners of the specified community can create community items');
    }

    const communityItem = this.repository.create({
      ...dto,
      membershipId: supervisorStatus.id,
      communityId: dto.communityId,
    });
    return await this.repository.save(communityItem);
  }

  async findAllCommunityItems(
    userId: string,
    type?: CommunityItemType,
  ): Promise<Array<CommunityItem & { isActive: boolean }>> {
    const query = this.repository.createQueryBuilder('communityItem');
    if (type) query.where('communityItem.type = :type', { type });

    const items = await query.orderBy('communityItem.createdAt', 'DESC').getMany();
    if (!items.length) return [];

    const statuses = await this.membershipService.findAllByUser(userId);
    const userMembershipIds = statuses.map((s) => s.id);
    if (!userMembershipIds.length) return items.map((item) => ({ ...item, isActive: false }));

    const likes = await this.likeRepository.find({
      select: { communityItemId: true },
      where: {
        communityItemId: In(items.map((i) => i.id)),
        membershipId: In(userMembershipIds),
        isActive: true,
      },
    });
    const likedIds = new Set(likes.map((l) => l.communityItemId));
    return items.map((item) => ({ ...item, isActive: likedIds.has(item.id) }));
  }

  async findOneCommunityItem(id: string): Promise<CommunityItem | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['membership'],
    });
  }

  async findByMembershipId(
    membershipId: string,
    communityId: string,
    type?: CommunityItemType,
  ): Promise<Array<CommunityItem & { isActive: boolean }>> {
    const query = this.repository
      .createQueryBuilder('communityItem')
      .where('communityItem.membershipId = :membershipId', { membershipId })
      .andWhere('communityItem.communityId = :communityId', { communityId });
    if (type) query.andWhere('communityItem.type = :type', { type });

    const items = await query.orderBy('communityItem.createdAt', 'DESC').getMany();
    if (!items.length) return [];

    const likes = await this.likeRepository.find({
      select: { communityItemId: true },
      where: {
        communityItemId: In(items.map((i) => i.id)),
        membershipId,
        isActive: true,
      },
    });
    const likedIds = new Set(likes.map((l) => l.communityItemId));
    return items.map((item) => ({ ...item, isActive: likedIds.has(item.id) }));
  }

  private async isItemOwner(id: string, userId: string): Promise<CommunityItem> {
    const item = await this.findOneCommunityItem(id);
    if (!item) throw new NotFoundException('Community item not found');

    const statuses = await this.membershipService.findAllByUser(userId);
    if (!statuses.some((s) => s.id === item.membershipId)) throw new ForbiddenException();
    return item;
  }

  async update(id: string, userId: string, dto: UpdateCommunityItemsDto): Promise<CommunityItem> {
    const item = await this.isItemOwner(id, userId);
    Object.assign(item, dto);
    return await this.repository.save(item);
  }

  async remove(id: string, userId: string): Promise<{ affected?: number }> {
    await this.isItemOwner(id, userId);
    const result = await this.repository.delete(id);
    return { affected: result.affected ?? undefined };
  }
}
