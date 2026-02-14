import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Membership } from '../../membership/entities/membership.entity';
import { CommunityType } from '../../../common/enums/community-enums/community-type';
import { CommunityItem } from 'src/community/community-items/entities/community-items.entity';

@Entity('community_data')
export class CommunityData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: CommunityType,
    default: CommunityType.Other,
    nullable: true,
  })
  type: CommunityType;

  @Column({ nullable: true, length: 200 })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSlugChangeAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Membership, (membership) => membership.community)
  memberships: Membership[];

  @OneToMany(() => CommunityItem, (communityItem) => communityItem.community)
  communityItems: CommunityItem[];
}
