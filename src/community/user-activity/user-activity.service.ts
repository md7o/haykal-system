import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Comment } from './entities/comment.entity';
import { CommunityItem } from '../community-items/entities/community-items.entity';
import { MembershipService } from '../membership/membership.service';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommunityItem)
    private readonly communityItemRepository: Repository<CommunityItem>,
    private readonly membershipService: MembershipService,
  ) {}

  private async getMembershipIdForItemOrThrow(userId: string, communityItemId: string): Promise<string> {
    const item = await this.communityItemRepository.findOne({ where: { id: communityItemId } });
    if (!item) throw new NotFoundException('Community item not found');

    const itemMembership = await this.membershipService.findOne(item.membershipId);
    if (!itemMembership) throw new NotFoundException('Item membership not found');

    const userMemberships = await this.membershipService.findByUserAndCommunity(userId, itemMembership.communityId);
    const userMembership = userMemberships[0];
    if (!userMembership) {
      throw new ForbiddenException('User must have a membership in this community to perform this action');
    }

    return userMembership.id;
  }

  // ============= LIKES METHODS =============
  async toggleLike(userId: string, communityItemId: string): Promise<{ isActive: boolean; likesCount: number }> {
    const membershipId = await this.getMembershipIdForItemOrThrow(userId, communityItemId);

    // ensure item exists (needed for likesCount update)
    const item = await this.communityItemRepository.findOne({ where: { id: communityItemId } });
    if (!item) throw new NotFoundException('Community item not found');

    const existingLike = await this.likeRepository.findOne({
      where: {
        communityItemId,
        membershipId: membershipId,
      },
    });

    if (existingLike) {
      const nextIsActive = !existingLike.isActive;
      existingLike.isActive = nextIsActive;
      await this.likeRepository.save(existingLike);

      if (nextIsActive) {
        await this.communityItemRepository.increment({ id: communityItemId }, 'likesCount', 1);
        return { isActive: true, likesCount: (item.likesCount ?? 0) + 1 };
      }

      if ((item.likesCount ?? 0) > 0) {
        await this.communityItemRepository.decrement({ id: communityItemId }, 'likesCount', 1);
      }
      return { isActive: false, likesCount: Math.max(0, (item.likesCount ?? 0) - 1) };
    }

    await this.likeRepository.save({ membershipId: membershipId, communityItemId, isActive: true });
    await this.communityItemRepository.increment({ id: communityItemId }, 'likesCount', 1);
    return { isActive: true, likesCount: (item.likesCount ?? 0) + 1 };
  }

  async countLikesByCommunityItem(communityItemId: string): Promise<number> {
    return await this.likeRepository.count({ where: { communityItemId, isActive: true } });
  }

  // ============= COMMENTS METHODS =============
  // Method One
  async createComment(userId: string, communityItemId: string, content: string): Promise<Comment> {
    const membershipId = await this.getMembershipIdForItemOrThrow(userId, communityItemId);
    // ensure item exists
    const item = await this.communityItemRepository.findOne({ where: { id: communityItemId } });
    if (!item) throw new NotFoundException('Community item not found');

    const comment = this.commentRepository.create({
      membershipId: membershipId,
      communityItemId,
      content,
    });
    const saved = await this.commentRepository.save(comment);
    await this.communityItemRepository.increment({ id: communityItemId }, 'commentsCount', 1);
    return saved;
  }
  // Method Two
  async findAllCommentsByCommunityItem(communityItemId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { communityItemId },
      relations: ['membership'],
      order: { createdAt: 'DESC' },
    });
  }
  //  Method Three
  async findAllCommentsByUser(userId: string): Promise<Comment[]> {
    const memberships = await this.membershipService.findAllByUser(userId);
    if (memberships.length === 0) return [];

    const membershipIds = memberships.map((m) => m.id);
    return await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.membershipId IN (:...ids)', { ids: membershipIds })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
  }
  //  Method Four
  async findOneComment(commentId: string): Promise<Comment | null> {
    return await this.commentRepository.findOne({ where: { id: commentId } });
  }
  //  Method Five
  async updateComment(commentId: string, content?: string): Promise<Comment> {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new BadRequestException('content is required');
    }

    const comment = await this.findOneComment(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    comment.content = content;
    return await this.commentRepository.save(comment);
  }
  // Method Six
  async removeComment(commentId: string): Promise<{ affected?: number }> {
    const comment = await this.findOneComment(commentId);
    if (!comment) return { affected: 0 };

    const result = await this.commentRepository.delete(commentId);
    if (result.affected && result.affected > 0) {
      // decrement item comment count only if > 0
      try {
        const item = await this.communityItemRepository.findOne({ where: { id: comment.communityItemId } });
        if (item && item.commentsCount && item.commentsCount > 0) {
          await this.communityItemRepository.decrement({ id: comment.communityItemId }, 'commentsCount', 1);
        }
      } catch (e) {
        // ignore decrement errors to not fail delete; log if you have logger
      }
    }
    return { affected: result.affected ?? undefined };
  }
  // Method Seven
  async countCommentsByMembership(membershipId: string): Promise<number> {
    return await this.commentRepository.count({ where: { membershipId } });
  }
  // Method Eight
  async countCommentsByUser(userId: string): Promise<number> {
    const memberships = await this.membershipService.findAllByUser(userId);
    if (memberships.length === 0) return 0;

    const membershipIds = memberships.map((m) => m.id);
    return await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.membershipId IN (:...ids)', { ids: membershipIds })
      .getCount();
  }
}
