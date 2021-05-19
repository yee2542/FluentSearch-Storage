import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ConfigAppProviderType } from './config/@types/config-app.type';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  const app = await NestFactory.create(AppModule);

  const config: ConfigAppProviderType = app
    .select(ConfigModule)
    .get(ConfigService)
    .get();

  app.enableCors({
    origin: [config.origin],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  const options = new DocumentBuilder()

    .setTitle('FluentSearch Storage')
    .setVersion('1.0')
    .addCookieAuth('Authorization', {
      type: 'apiKey',
      in: 'cookie',
      bearerFormat: 'JWT',
      name: 'Authorization',
    })

    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);
  await app.listen(config.port);
}
bootstrap();
