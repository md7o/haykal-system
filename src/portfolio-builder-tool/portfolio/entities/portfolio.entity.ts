import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, OneToMany, Index, OneToOne } from 'typeorm';
import { User } from '../../../user/entities/user.entity';
import { Page } from '../../pages/entities/page.entity';

@Entity('portfolio')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50, nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: 'DRAFT' | 'PUBLISHED';

  @OneToMany(() => Page, (page) => page.portfolio, { cascade: true, orphanedRowAction: 'delete' })
  pages: Page[];

  // Optional: global assets (e.g., shared images, logos)
  @Column({ type: 'jsonb', nullable: true })
  assets: Record<string, any> | null;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastActiveAt: Date | null;
}
