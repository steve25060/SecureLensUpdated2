import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for the frontend origin (adjust as needed)
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Set global API prefix
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
