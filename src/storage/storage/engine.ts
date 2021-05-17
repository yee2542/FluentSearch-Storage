import { Request } from 'express';
import { StorageEngine } from 'multer';

export class Engine implements StorageEngine {
  _handleFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error?: any, info?: Partial<Express.Multer.File>) => void,
  ) {
    return;
  }

  _removeFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null) => void,
  ) {
    return;
  }
}
