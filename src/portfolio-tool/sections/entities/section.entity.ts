import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Page } from '../../pages/entities/page.entity';
import { SectionsType } from 'src/common/enums/portfolio-enums/sections-type';

@Entity('section')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'page_id', type: 'uuid' })
  pageId: string;

  @ManyToOne(() => Page, (page) => page.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @Column({ type: 'enum', enum: SectionsType, default: SectionsType.Header })
  type: SectionsType;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  config: Record<string, any>; // Section-specific content data

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
