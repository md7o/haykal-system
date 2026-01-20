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
import { CommunityItem } from '../../community-items/entities/community-items.entity';
import { Membership } from '../../membership/entities/membership.entity';

@Entity('likes')
@Unique(['membershipId', 'communityItemId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_likes_membership_id')
  @Column({ type: 'uuid' })
  membershipId: string;

  @ManyToOne(() => Membership, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membershipId' })
  membership: Membership;

  @Index('idx_likes_community_item_id')
  @Column({ type: 'uuid' })
  communityItemId: string;

  @ManyToOne(() => CommunityItem, (communityItem) => communityItem.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'communityItemId' })
  communityItem: CommunityItem;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
