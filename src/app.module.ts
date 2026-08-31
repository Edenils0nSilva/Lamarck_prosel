import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { ProcessingModule } from './processing/processing.module';
import { QueryModule } from './query/query.module';
import { ReviewModule } from './review/review.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    InfrastructureModule.forRoot(),
    IngestionModule,
    ProcessingModule,
    QueryModule,
    ReviewModule,
    HealthModule,
  ],
})
export class AppModule {}
