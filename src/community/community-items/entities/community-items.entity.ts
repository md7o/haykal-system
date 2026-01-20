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
import { CommunityItemType } from '../../../common/enums/community-item-type';
import type { CommunityItemMetadata } from '../../../common/interfaces/community-item-metadata.interface';
import { CommunityData } from 'src/community/community-data/entities/community-data.entity';

@Entity('community_items')
export class CommunityItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_community_items_type')
  @Column({ type: 'enum', enum: CommunityItemType, default: CommunityItemType.POST })
  type: CommunityItemType;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  postImage: string;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'int', default: 0 })
  commentsCount: number;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata: CommunityItemMetadata;

  @Index('idx_community_items_membership_id')
  @Column({ type: 'uuid' })
  membershipId: string;

  @Column({ type: 'uuid' })
  communityId: string;

  @ManyToOne(() => CommunityData, (communityData) => communityData.communityItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'communityId' })
  community: CommunityData;

  @ManyToOne(() => Membership, (membership) => membership.communityItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membershipId' })
  membership: Membership;

  @OneToMany(() => Like, (like) => like.communityItem)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.communityItem)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
