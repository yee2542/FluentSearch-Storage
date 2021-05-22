import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidMimeFileException extends HttpException {
  constructor() {
    super('Unsupport file type', HttpStatus.UNSUPPORTED_MEDIA_TYPE);
  }
}
