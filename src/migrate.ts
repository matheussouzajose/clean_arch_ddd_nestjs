import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { MigrationsModule } from './nest-modules/database-module/migrations.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { migrator } from '@core/shared/infrastructure/database/sequelize/migrator';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationsModule, {
    logger: ['error'],
  });

  const sequelize = app.get(getConnectionToken());
  await migrator(sequelize).runAsCLI();
}
bootstrap();
