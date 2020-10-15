import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import fileCustomStorage from './file.custom.storage';

@Injectable()
export class FileConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    return {
      storage: fileCustomStorage,
    };
  }
}
