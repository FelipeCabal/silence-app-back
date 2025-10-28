import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CORS } from './config/constants/cors';
import * as morgan from 'morgan';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.use(morgan(configService.get('ENVIRONMENT', 'combined')));
  app.setGlobalPrefix('api');
  app.enableCors(CORS);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const config = new DocumentBuilder()
    .setTitle('Silence App API')
    .setDescription('The Silence App API description')
    .setVersion('1.0')
    .addTag('Silence App API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get('PORT', 3000));
}
bootstrap();