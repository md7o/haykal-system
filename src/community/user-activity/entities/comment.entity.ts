import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CommunityItem } from '../../community-items/entities/community-items.entity';
import { Membership } from '../../membership/entities/membership.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_comments_membership_id')
  @Column({ type: 'uuid' })
  membershipId: string;

  @ManyToOne(() => Membership, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'membershipId' })
  membership: Membership;

  @Index('idx_comments_community_item_id')
  @Column({ type: 'uuid' })
  communityItemId: string;

  @ManyToOne(() => CommunityItem, (communityItem) => communityItem.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'communityItemId' })
  communityItem: CommunityItem;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
