import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { MembershipService } from '../membership/membership.service';
import { MembershipType } from '../../common/enums/membership-type';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
    private readonly membershipService: MembershipService,
  ) {}

  async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
    const statuses = await this.membershipService.findAllByUser(userId);
    const supervisorStatus = statuses.find((s) => s.userType === MembershipType.Supervisor);

    if (!supervisorStatus) {
      throw new ForbiddenException('Only supervisors can create posts');
    }

    const post = this.repository.create({
      ...dto,
      membershipId: supervisorStatus.id,
    });
    return await this.repository.save(post);
  }

  async findAllPosts(userId: string): Promise<Post[]> {
    const statuses = await this.membershipService.findAllByUser(userId);
    if (statuses.length === 0) return [];

    const statusIds = statuses.map((s) => s.id);
    return await this.repository
      .createQueryBuilder('post')
      .where('post.userStatusId IN (:...ids)', { ids: statusIds })
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async findOnePost(id: string): Promise<Post | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['userStatus'],
    });
  }

  async update(id: string, userId: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOnePost(id);
    if (!post) throw new NotFoundException('Post not found');

    const statuses = await this.membershipService.findAllByUser(userId);
    const isOwner = statuses.some((s) => s.id === post.membershipId);

    if (!isOwner) throw new ForbiddenException();

    Object.assign(post, dto);
    return await this.repository.save(post);
  }

  async remove(id: string, userId: string): Promise<{ affected?: number }> {
    const post = await this.findOnePost(id);
    if (!post) throw new NotFoundException('Post not found');

    const statuses = await this.membershipService.findAllByUser(userId);
    const isOwner = statuses.some((s) => s.id === post.membershipId);

    if (!isOwner) throw new ForbiddenException();

    const result = await this.repository.delete(id);
    return { affected: result.affected ?? undefined };
  }
}
