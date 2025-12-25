// import {
//   Column,
//   Entity,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   CreateDateColumn,
//   UpdateDateColumn,
//   JoinColumn,
//   Index,
// } from 'typeorm';
// import { UserStatus } from '../../user-status/entities/user-status.entity';
// import { Post } from '../../posts/entities/post.entity';
// import { UserActivityType } from '../../../common/enums/user-activity-type';

// @Entity('user_activity')
// export class UserActivity {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ type: 'enum', enum: UserActivityType })
//   activityType: UserActivityType;

//   @Column({ type: 'text', nullable: true })
//   comment?: string;

//   @Column({ type: 'int', nullable: true })
//   value?: number;

//   @Index('idx_user_activity_user_status_id')
//   @Column({ type: 'uuid' })
//   userStatusId: string;

//   @ManyToOne(() => UserStatus, (status) => status.userActivities, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'userStatusId' })
//   userStatus: UserStatus;

//   @Index('idx_user_activity_post_id')
//   @Column({ type: 'uuid' })
//   postId: string;

//   @ManyToOne(() => Post, (post) => post.activities, { onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'postId' })
//   post: Post;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;
// }
