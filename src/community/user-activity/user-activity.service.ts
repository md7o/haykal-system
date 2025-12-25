import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Comment } from './entities/comment.entity';
import { Save } from './entities/save.entity';
import { Post } from '../posts/entities/post.entity';
import { MembershipService } from '../membership/membership.service';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Save)
    private readonly saveRepository: Repository<Save>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly membershipService: MembershipService,
  ) {}

  private async getMembershipIdOrThrow(userId: string): Promise<string> {
    const memberships = await this.membershipService.findAllByUser(userId);
    const membership = memberships[0];
    if (!membership) {
      throw new ForbiddenException('User must have a membership to perform this action');
    }
    return membership.id;
  }

  // ============= LIKES METHODS =============
  async toggleLike(userId: string, postId: string): Promise<Like> {
    const membershipId = await this.getMembershipIdOrThrow(userId);
    // ensure post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existingLike = await this.likeRepository.findOne({
      where: {
        postId,
        userStatusId: membershipId,
      },
    });

    if (existingLike) {
      const removed = await this.likeRepository.remove(existingLike);
      // only decrement if current count > 0
      if (post.likesCount && post.likesCount > 0) {
        await this.postRepository.decrement({ id: postId }, 'likesCount', 1);
      }
      return removed;
    }

    const saved = await this.likeRepository.save({ userStatusId: membershipId, postId });
    await this.postRepository.increment({ id: postId }, 'likesCount', 1);
    return saved;
  }

  async countLikesByPost(postId: string): Promise<number> {
    return await this.likeRepository.count({ where: { postId } });
  }

  // ============= COMMENTS METHODS =============
  async createComment(userId: string, postId: string, content: string): Promise<Comment> {
    const membershipId = await this.getMembershipIdOrThrow(userId);
    // ensure post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepository.create({
      userStatusId: membershipId,
      postId,
      content,
    });
    const saved = await this.commentRepository.save(comment);
    await this.postRepository.increment({ id: postId }, 'commentsCount', 1);
    return saved;
  }

  async findAllCommentsByPost(postId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { postId },
      relations: ['membership'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllCommentsByUser(userId: string): Promise<Comment[]> {
    const memberships = await this.membershipService.findAllByUser(userId);
    if (memberships.length === 0) return [];

    const membershipIds = memberships.map((m) => m.id);
    return await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.userStatusId IN (:...ids)', { ids: membershipIds })
      .orderBy('comment.createdAt', 'DESC')
      .getMany();
  }

  async findOneComment(commentId: string): Promise<Comment | null> {
    return await this.commentRepository.findOne({ where: { id: commentId } });
  }

  async updateComment(commentId: string, content?: string): Promise<Comment> {
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new BadRequestException('content is required');
    }

    const comment = await this.findOneComment(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    comment.content = content;
    return await this.commentRepository.save(comment);
  }

  async removeComment(commentId: string): Promise<{ affected?: number }> {
    const comment = await this.findOneComment(commentId);
    if (!comment) return { affected: 0 };

    const result = await this.commentRepository.delete(commentId);
    if (result.affected && result.affected > 0) {
      // decrement post comment count only if > 0
      try {
        const post = await this.postRepository.findOne({ where: { id: comment.postId } });
        if (post && post.commentsCount && post.commentsCount > 0) {
          await this.postRepository.decrement({ id: comment.postId }, 'commentsCount', 1);
        }
      } catch (e) {
        // ignore decrement errors to not fail delete; log if you have logger
      }
    }
    return { affected: result.affected ?? undefined };
  }

  async countCommentsByPost(postId: string): Promise<number> {
    return await this.commentRepository.count({ where: { postId } });
  }

  // ============= SAVES METHODS =============
  async toggleSave(userId: string, postId: string): Promise<Save> {
    const membershipId = await this.getMembershipIdOrThrow(userId);

    const existingSave = await this.saveRepository.findOne({
      where: {
        postId,
        userStatusId: membershipId,
      },
    });

    if (existingSave) {
      return this.saveRepository.remove(existingSave);
    }

    try {
      const save = this.saveRepository.create({
        userStatusId: membershipId,
        postId,
      });
      return await this.saveRepository.save(save);
    } catch (error: any) {
      if (error.code === '23505' || error.message.includes('Unique')) {
        throw new ConflictException('User has already saved this post');
      }
      throw error;
    }
  }

  async findAllSavesByPost(postId: string): Promise<Save[]> {
    return await this.saveRepository.find({
      where: { postId },
      relations: ['membership'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllSavesByUser(userId: string): Promise<Save[]> {
    const memberships = await this.membershipService.findAllByUser(userId);
    if (memberships.length === 0) return [];

    const membershipIds = memberships.map((m) => m.id);
    return await this.saveRepository
      .createQueryBuilder('save')
      .where('save.userStatusId IN (:...ids)', { ids: membershipIds })
      .orderBy('save.createdAt', 'DESC')
      .getMany();
  }

  async removeSave(saveId: string): Promise<{ affected?: number }> {
    const result = await this.saveRepository.delete(saveId);
    return { affected: result.affected ?? undefined };
  }

  async removeSaveByUserAndPost(userId: string, postId: string): Promise<{ affected?: number }> {
    const membershipId = await this.getMembershipIdOrThrow(userId);

    const result = await this.saveRepository.delete({
      userStatusId: membershipId,
      postId,
    });
    return { affected: result.affected ?? undefined };
  }

  async countSavesByPost(postId: string): Promise<number> {
    return await this.saveRepository.count({ where: { postId } });
  }
}
