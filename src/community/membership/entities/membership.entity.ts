import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
  In,
} from 'typeorm';
import { CommunityItem } from '../../community-items/entities/community-items.entity';
import { User } from '../../../user/entities/user.entity';
import { MembershipType } from 'src/common/enums/community-enums/membership-type';
import { CommunityData } from '../../community-data/entities/community-data.entity';

@Entity('membership')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MembershipType, default: MembershipType.Member })
  role: MembershipType;

  @Column({ type: 'varchar', nullable: true })
  authorName: string;

  @Index('idx_user_status_user_id')
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index('idx_membership_community_id')
  @Column({ type: 'uuid' })
  communityId: string;

  @ManyToOne(() => CommunityData, (community) => community.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'communityId' })
  community: CommunityData;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CommunityItem, (communityItem) => communityItem.membership)
  communityItems?: CommunityItem[];
}
