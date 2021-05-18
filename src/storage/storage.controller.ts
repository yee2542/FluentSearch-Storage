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
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  FileListResponseDTO,
  FileTypeEnum,
  ZoneEnum,
} from 'fluentsearch-types';
import { ConfigService } from '../config/config.service';
import { StorageResponseDTO } from './dtos/storage.response.dto';

@Controller()
export class StorageController {
  constructor(private readonly configService: ConfigService) {}

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
  @ApiOkResponse({ type: StorageResponseDTO })
  @ApiCookieAuth('Authorization')
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
    // console.log(req.headers.Authorization);
    // console.log(req.cookies.Authorization);
    console.log(req.cookies?.Authorization);
    // console.log(req.headers);

    const endpoint =
      this.configService.get().storage_hostname || 'storage.fluentsearch.ml';

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

      uri: endpoint,
      thumbnail_uri: endpoint + '/thumbnail',

      createAt: new Date(),
      updateAt: new Date(),
    }));

    return res.send(resParsed);
  }
}
