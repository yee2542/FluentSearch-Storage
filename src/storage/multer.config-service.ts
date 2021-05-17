import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import Multer from 'multer';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: Multer.memoryStorage(),
      // dest: join(__dirname, '../upload'),
    };
  }
}
