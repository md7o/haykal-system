import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CategoryType } from 'src/enums/category-type';
import { LayoutType } from 'src/enums/layout-type';
import { Portfolio } from './portfolio.entity';

@Entity('custom_design')
export class CustomDesign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Portfolio, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolioId: Portfolio;

  @Column({ type: 'jsonb', nullable: true })
  sections: CategoryType;

  @Column({ type: 'jsonb', nullable: true })
  assets: LayoutType;

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
}
