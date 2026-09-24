import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import dotenv from 'dotenv';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;

  dotenv.config({ quiet: true });
  const app = await NestFactory.create(AppModule);
  await app.listen(port);

  console.log(`Server is running on: http://localhost:${port}`);
}
await bootstrap();
