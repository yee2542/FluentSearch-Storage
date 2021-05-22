import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidFileSizeExceptiom extends HttpException {
  constructor(size?: number) {
    super(
      `Payload Too Large, limits ${size} byte`,
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}
