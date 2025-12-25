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
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../../user/entities/user.entity';
import { MembershipType } from 'src/common/enums/membership-type';

@Entity('membership')
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string;

  @Column({ type: 'enum', enum: MembershipType, default: MembershipType.User })
  userType: MembershipType;

  @Index('idx_user_status_user_id')
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.membership)
  posts?: Post[];
}
