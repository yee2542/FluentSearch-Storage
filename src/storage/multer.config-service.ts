import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import multer from 'multer';
import mimeFileUtils from './utils/mime-file.utils';

const MAX_FILE_SIZE = 10 * 10 ** 6;
@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        try {
          mimeFileUtils(file.mimetype);
        } catch (error) {
          return cb(error, false);
        }
        cb(null, true);
      },
    };
  }
}
