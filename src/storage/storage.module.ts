import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '../config/config.module';
import { MulterConfigService } from './multer.config-service';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { MinioModule } from 'nestjs-minio-client';
import { MongooseModule } from '@nestjs/mongoose';
import { FILES_SCHEMA_NAME } from 'fluentsearch-types';
import fileSchema from 'fluentsearch-types/dist/entity/file.entity';

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
  ],
  providers: [StorageService],
  controllers: [StorageController],
  exports: [StorageService, JwtInstance, MinioInstance, ConfigModule],
})
export class StorageModule {}
