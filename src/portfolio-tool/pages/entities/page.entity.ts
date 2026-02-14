import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';
import { Section } from '../../sections/entities/section.entity';

@Entity('page')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'portfolio_id', type: 'uuid' })
  portfolioId: string;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.pages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column({ type: 'varchar', length: 25 })
  slug: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @OneToMany(() => Section, (section) => section.page, { cascade: true, orphanedRowAction: 'delete' })
  sections: Section[];
}
