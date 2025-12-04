/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const cfg = app.get(ConfigService);
  // app.setGlobalPrefix('api');

  const port = cfg.get('PORT') || 3000;
  console.log(`Server running on port ${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
