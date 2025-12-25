import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Membership } from '../../membership/entities/membership.entity';

@Entity('saves')
@Unique(['userStatusId', 'postId'])
export class Save {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_saves_user_status_id')
  @Column({ type: 'uuid' })
  userStatusId: string;

  @ManyToOne(() => Membership, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userStatusId' })
  membership: Membership;

  @Index('idx_saves_post_id')
  @Column({ type: 'uuid' })
  postId: string;

  @ManyToOne(() => Post, (post) => post.saves, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}
