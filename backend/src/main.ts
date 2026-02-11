import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  // Use Winston as the app logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // cookie parser
  app.use(cookieParser());

  // API versioning (optional – future-proofing)
  app.enableVersioning({ type: VersioningType.URI });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  const winstonLogger = app.get('winston');
  app.useGlobalFilters(new AllExceptionsFilter(winstonLogger));

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(winstonLogger));

  // CORS
  const allowedOrigins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth App API')
    .setDescription('Authentication API: Sign Up, Sign In, and protected endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken') 
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`\n🚀 Server running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs:      http://localhost:${port}/api/docs\n`);
}

bootstrap();