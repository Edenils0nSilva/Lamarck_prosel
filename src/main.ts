import 'dotenv/config';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Versionamento por caminho: /v1/...
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Validação/transformação global dos DTOs.
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
  new Logger('Bootstrap').log(`DOC Intelligence ouvindo em http://localhost:${port}`);
}

void bootstrap();
