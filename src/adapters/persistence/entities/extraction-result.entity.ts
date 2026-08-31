import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';
import { DocumentType, ExtractedField } from '../../../domain';

/** Resultado da classificação/extração de um documento. */
@Entity('extraction_results')
export class ExtractionResultEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('idx_results_document_id')
  @Column('uuid')
  documentId!: string;

  @Column({ type: 'varchar' })
  type!: DocumentType;

  @Column('double precision')
  confidence!: number;

  /** Campos extraídos guardados como JSON (jsonb no Postgres). */
  @Column({ type: 'jsonb' })
  fields!: ExtractedField[];

  @Column()
  modelVersion!: string;

  @Column()
  promptVersion!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
