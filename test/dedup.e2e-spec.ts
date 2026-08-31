import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Caminho crítico: um documento reenviado (mesmo conteúdo) não é reprocessado (RF03,
 * fato c). O 2º envio retorna duplicated=true e a lista permanece com 1 documento.
 *
 * Teste e2e real: sobe o AppModule (adaptadores em memória) e faz upload via HTTP.
 */
describe('Deduplicação (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const file = Buffer.from('conteudo-identico-para-dedup');
  const attach = () =>
    request(app.getHttpServer())
      .post('/v1/documents')
      .attach('file', file, { filename: 'scan.pdf', contentType: 'application/pdf' });

  it('1º envio cria o documento (duplicated=false)', async () => {
    const res = await attach().expect(202);
    expect(res.body.duplicated).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  it('2º envio idêntico retorna duplicated=true e o mesmo id', async () => {
    const res = await attach().expect(202);
    expect(res.body.duplicated).toBe(true);
  });

  it('a lista contém apenas 1 documento (não reprocessou)', async () => {
    const res = await request(app.getHttpServer()).get('/v1/documents').expect(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items).toHaveLength(1);
  });

  it('rejeita tipo não permitido com 415', async () => {
    await request(app.getHttpServer())
      .post('/v1/documents')
      .attach('file', Buffer.from('x'), { filename: 'x.txt', contentType: 'text/plain' })
      .expect(415);
  });
});
