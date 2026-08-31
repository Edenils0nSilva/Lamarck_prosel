import { DocumentType, ExtractedField } from '../domain';

const mimeExt: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();
}

/**
 * Propõe um nome de arquivo padronizado a partir do tipo e dos campos extraídos
 * (RF07) — derivado do conteúdo, nunca do nome recebido (fato b).
 * Ex.: IDENTIDADE_FULANO-DE-TAL_1990-01-01.jpg
 */
export function buildStandardizedName(
  type: DocumentType,
  fields: ExtractedField[],
  mimeType: string,
): string {
  const byName = (n: string) => fields.find((f) => f.name === n)?.value;
  const ext = mimeExt[mimeType] ?? 'bin';
  const parts: string[] = [type];
  const nome = byName('nome');
  if (nome) parts.push(slug(nome));
  const data = byName('dataNascimento');
  if (data) parts.push(data);
  return `${parts.join('_')}.${ext}`;
}
