import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller()
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
  @ApiOkResponse({ type: StreamResponseDTO })
  @ApiBearerAuth('JWT')
  @ApiConsumes('multipart/form-data')
  @Post('/')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const resParsed = files.map(f => ({ ...f, buffer: undefined }));
    res.send(resParsed);
  }
}
