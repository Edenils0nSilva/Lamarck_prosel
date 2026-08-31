import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { DocumentSource, DocumentStatus } from '../../../domain';

/** Mapeamento relacional do documento (metadados; o binário fica no storage). */
@Entity('documents')
export class DocumentEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column()
  originalFilename!: string;

  @Column()
  mimeType!: string;

  @Column('bigint')
  sizeBytes!: number;

  /** Índice único sustenta a deduplicação (RF03). */
  @Index('uq_documents_content_hash', { unique: true })
  @Column()
  contentHash!: string;

  @Column({ type: 'varchar', default: DocumentSource.DESCONHECIDO })
  source!: DocumentSource;

  @Column({ type: 'varchar' })
  status!: DocumentStatus;

  @Column({ type: 'varchar', nullable: true })
  standardizedName?: string;

  @Column()
  storageKey!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
