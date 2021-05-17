import {
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('stream')
export class StreamController {
  @ApiOperation({
    summary: 'Upload a file.',
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: { files: { type: 'string', format: 'binary' } },
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post('/')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
  ) {
    console.log(req.files);
  }
}
