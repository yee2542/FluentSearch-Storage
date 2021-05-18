import {
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
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
  UserSessionDto,
  ZoneEnum,
} from 'fluentsearch-types';
import { join, resolve } from 'path';
import { ConfigService } from '../config/config.service';
import { UserTokenInfo } from './decorators/user-token-info.decorator';
import { StorageResponseDTO } from './dtos/storage.response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Controller()
export class StorageController {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(JwtAuthGuard)
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
    @UserTokenInfo() user: UserSessionDto,
  ): Promise<Response<FileListResponseDTO[]>> {
    const logs = files.map(el => ({ ...el, buffer: undefined }));
    Logger.verbose(logs, 'Stream [POST]');

    const endpoint =
      this.configService.get().storage_hostname || 'storage.fluentsearch.ml';
    const userId = Math.random()
      .toString()
      .replace('.', '');
    const fileId = Math.random()
      .toString()
      .replace('.', '');
    const resParsed: FileListResponseDTO[] = files.map(el => ({
      _id: fileId,
      original_filename: el.originalname,
      owner: user._id,
      zone: ZoneEnum.TH,
      label: el.filename,
      type: el.mimetype.includes('image')
        ? FileTypeEnum.Image
        : FileTypeEnum.Video,
      refs: undefined,

      uri: join(endpoint, userId, fileId),
      thumbnail_uri: join(endpoint, userId, fileId, 'thumbnail'),

      createAt: new Date(),
      updateAt: new Date(),
    }));

    return res.send(resParsed);
  }

  @Get('/:user/:fild_id')
  async sendUserFile(@Res() res: Response) {
    res.sendFile(resolve('src/storage/sample.jpeg'));
  }
}
