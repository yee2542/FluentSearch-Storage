import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidFileIdException extends HttpException {
  constructor() {
    super(`File _id is not exist`, HttpStatus.FORBIDDEN);
  }
}
