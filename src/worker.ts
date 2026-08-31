import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Ponto de entrada do worker de processamento.
 *
 * No esqueleto, a fila é em memória e o ProcessingService já registra seu consumidor
 * ao subir o AppModule (via onModuleInit) — então a API e o worker vivem no mesmo
 * processo. Quando a fila for BullMQ/Redis, este arquivo passa a rodar o worker num
 * processo separado (createApplicationContext, sem servidor HTTP).
 */
async function bootstrapWorker(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
  new Logger('Worker').log('Worker de processamento ativo (fila em memória).');
}

void bootstrapWorker();
