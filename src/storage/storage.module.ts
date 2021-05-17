import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '../config/config.module';
import { MulterConfigService } from './multer.config-service';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useClass: MulterConfigService,
    }),
  ],
  providers: [StorageService],
  controllers: [StorageController],
})
export class StorageModule {}
