import {
  Controller,
  Logger,
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
import {
  FileListResponseDTO,
  FileTypeEnum,
  ZoneEnum,
} from 'fluentsearch-types';
import { StreamResponseDTO } from './dtos/stream.response.dto';

@Controller()
export class StorageController {
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
  ): Promise<Response<FileListResponseDTO[]>> {
    const logs = files.map(el => ({ ...el, buffer: undefined }));
    Logger.verbose(logs, 'Stream [POST]');

    const resParsed: FileListResponseDTO[] = files.map(el => ({
      _id: Math.random()
        .toString()
        .replace('.', ''),
      owner: Math.random()
        .toString()
        .replace('.', ''),
      zone: ZoneEnum.TH,
      label: el.filename,
      type: el.mimetype.includes('image')
        ? FileTypeEnum.Image
        : FileTypeEnum.Video,
      refs: 'string',

      uri: 'storage.fluentsearch.ml',
      thumbnail_uri: 'storage.fluentsearch.ml',

      createAt: new Date(),
      updateAt: new Date(),
    }));

    return res.send(resParsed);
  }
}
