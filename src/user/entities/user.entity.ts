import { UserRole } from '../../common/enums/user-role';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Portfolio } from '../../portfolio-builder-tool/portfolio/entities/portfolio.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.User,
  })
  role: UserRole;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'text', nullable: true })
  bannedReason?: string;

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

  @OneToOne(() => Portfolio, (portfolio) => portfolio.user)
  portfolio: Portfolio;
}
