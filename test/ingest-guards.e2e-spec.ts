import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Guardas de ingestão (fato b): quem envia não valida nada, então tipo
 * inválido e ausência de arquivo são alcançáveis por uso normal, não só por
 * má-fé. O serviço recusa cedo, sem enfileirar.
 */
describe('Guardas de ingestão (e2e)', () => {
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

  it('tipo não permitido é recusado com 415', async () => {
    await request(app.getHttpServer())
      .post('/v1/documents')
      .attach('file', Buffer.from('x'), { filename: 'x.txt', contentType: 'text/plain' })
      .expect(415);
  });

  it('envio sem arquivo é recusado com 400', async () => {
    await request(app.getHttpServer()).post('/v1/documents').expect(400);
  });
});
