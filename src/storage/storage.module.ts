import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { EXCHANGE_UPLOAD, FILES_SCHEMA_NAME } from 'fluentsearch-types';
import fileSchema from 'fluentsearch-types/dist/entity/file.entity';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { MulterConfigService } from './multer.config-service';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

const MinioInstance = MinioModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    endPoint: config.get().minio.endpoint,
    accessKey: config.get().minio.access_key,
    secretKey: config.get().minio.secret_key,
    port: config.get().minio.port,
    useSSL: config.get().minio.ssl,
  }),
});

const JwtInstance = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get().jwt.secretKey,
    signOptions: {
      expiresIn: config.get().jwt.expires,
      algorithm: 'HS256',
    },
  }),
});

const RabbitInstance = RabbitMQModule.forRootAsync(RabbitMQModule, {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configSerivce: ConfigService) => {
    const config = configSerivce.get().rabbitmq;
    return {
      uri: `amqp://${config.username}:${config.password}@${config.endpoint}:5672`,

      exchanges: [{ name: EXCHANGE_UPLOAD, type: 'direct' }],
    };
  },
});
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: FILES_SCHEMA_NAME,
        schema: fileSchema,
      },
    ]),
    JwtInstance,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useClass: MulterConfigService,
    }),
    MinioInstance,
    RabbitInstance,
  ],
  providers: [StorageService],
  controllers: [StorageController],
  exports: [
    StorageService,
    JwtInstance,
    MinioInstance,
    ConfigModule,
    RabbitInstance,
  ],
})
export class StorageModule {}
