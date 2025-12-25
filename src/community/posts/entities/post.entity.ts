import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Membership } from '../../membership/entities/membership.entity';
import { Like } from '../../user-activity/entities/like.entity';
import { Comment } from '../../user-activity/entities/comment.entity';
import { Save } from '../../user-activity/entities/save.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  postImage: string;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  commentsCount: number;

  @Index('idx_posts_user_status_id')
  @Column({ type: 'uuid' })
  membershipId: string;

  @ManyToOne(() => Membership, (membership) => membership.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membershipId' })
  membership: Membership;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Save, (save) => save.post)
  saves: Save[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
