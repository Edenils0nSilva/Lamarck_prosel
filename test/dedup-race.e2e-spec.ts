import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Caminho crítico: dois envios idênticos SIMULTÂNEOS não podem estourar 500
 * nem criar registro duplicado (fatos c e e). Ambos passam pelo findByHash sem
 * achar e tentam inserir; a colisão de hash é arbitrada e o perdedor responde
 * idempotente, não com erro.
 */
describe('Deduplicação sob corrida (e2e)', () => {
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

  const file = Buffer.from('conteudo-identico-corrida');
  const attach = () =>
    request(app.getHttpServer())
      .post('/v1/documents')
      .attach('file', file, { filename: 'scan.pdf', contentType: 'application/pdf' });

  it('dois envios idênticos ao mesmo tempo: nenhum 500 e a lista fica com 1', async () => {
    const [a, b] = await Promise.all([attach(), attach()]);

    for (const res of [a, b]) {
      expect(res.status).not.toBe(500);
      expect([200, 202]).toContain(res.status);
      expect(res.body.id).toBeDefined();
    }

    const list = await request(app.getHttpServer()).get('/v1/documents').expect(200);
    expect(list.body.total).toBe(1);
    expect(list.body.items).toHaveLength(1);
  });
});
