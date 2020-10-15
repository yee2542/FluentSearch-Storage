import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import fileMetaExtractorUtil from './utils/file.meta.extractor.util';

@Injectable()
export class FileStreamUploadInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest() as Request;
    // const writeFileStream = fs.createWriteStream('./test.file', { flags: 'a' })
    console.log(req.headers);
    // req.pipe(writeFileStream)
    req.on('data', chunk => {
      console.log(fileMetaExtractorUtil(String(chunk).trim()));
      // writeFileStream.write(chunk)
      // console.log('chunk', String(chunk).length)
    });
    // req.on('close', () => writeFileStream.close())
    return next.handle();
  }
}
