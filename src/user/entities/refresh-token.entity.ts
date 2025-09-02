import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  token: string;

  @Column({ nullable: true })
  deviceInfo: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP', nullable: false })
  expiresAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
