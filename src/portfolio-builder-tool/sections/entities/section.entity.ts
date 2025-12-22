import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Page } from '../../pages/entities/page.entity';

@Entity('section')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'page_id', type: 'uuid' })
  pageId: string;

  @ManyToOne(() => Page, (page) => page.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'hero', 'text', etc.

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  order: number;
}
