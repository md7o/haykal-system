import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';
import { ColorTheme } from 'src/common/enums/portfolio-enums/color-theme';
import { FontTheme } from 'src/common/enums/portfolio-enums/font-theme';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'portfolio_id', type: 'uuid', unique: true })
  portfolioId: string;

  @ManyToOne(() => Portfolio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column({ type: 'enum', enum: ColorTheme, default: ColorTheme.BLUE })
  colorTheme: ColorTheme;

  @Column({ type: 'enum', enum: FontTheme, default: FontTheme.CAIRO })
  fontTheme: FontTheme;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
