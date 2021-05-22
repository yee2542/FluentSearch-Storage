import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidFileSizeException extends HttpException {
  constructor(size?: number) {
    super(
      `Payload Too Large, limits ${size} byte`,
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}
