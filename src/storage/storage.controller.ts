import {
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
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
  UserSessionDto,
  ZoneEnum,
} from 'fluentsearch-types';
import { Types } from 'mongoose';
import { MinioService } from 'nestjs-minio-client';
import { join } from 'path';
import { ConfigService } from '../config/config.service';
import { UserTokenInfo } from './decorators/user-token-info.decorator';
import { StorageResponseDTO } from './dtos/storage.response.dto';
import { InvalidFileIdException } from './exceptions/invalid-file-id.exception';
import { InvalidUserAccessException } from './exceptions/invalid-user-access.exception';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { StorageService } from './storage.service';
import mimeFileUtils from './utils/mime-file.utils';

@Controller()
export class StorageController {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly minioClient: MinioService,
  ) {}

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
  ): Promise<Response<StorageResponseDTO[]>> {
    const logs = files.map(el => ({ ...el, buffer: undefined }));
    const mappedFiles = files.map(el => ({
      ...el,
      _id: Types.ObjectId(),
      type: mimeFileUtils(el.mimetype),
    }));

    const now = new Date();
    Logger.verbose(logs, 'Stream [POST]');
    Logger.verbose(user._id + ' - ' + user.name, 'User');

    // bucket validation
    const valid = await this.minioClient.client.bucketExists(user._id);
    if (!valid) {
      Logger.warn('Bucket not existing', 'Minio');
      Logger.warn('Create new bucket', 'Minio');
      await this.minioClient.client.makeBucket(user._id, user.zone);
    }

    // bucket upload
    const bucketUpload = mappedFiles.map(file =>
      this.minioClient.client.putObject(
        user._id,
        `${file._id.toHexString()}-${file.originalname}`,
        file.buffer,
      ),
    );
    await Promise.all(bucketUpload);

    // create fluentsearch files
    const fileMeta = mappedFiles.map(async file => {
      const meta = await this.storageService.metaParsing(
        file.type,
        file.buffer,
        file.mimetype,
      );
      return this.storageService.createMeta({
        _id: file._id,
        owner: user._id,
        original_filename: file.originalname,
        type: file.type,
        zone: user.zone,
        meta,
      });
    });
    await Promise.all(fileMeta);

    // response
    const endpoint = this.configService.get().storage_hostname;
    const resParsed: FileListResponseDTO[] = mappedFiles.map(file => ({
      _id: file._id.toHexString(),
      original_filename: file.originalname,
      owner: user._id,
      zone: (user.zone as unknown) as ZoneEnum,
      type: file.type,
      refs: undefined,
      uri: join(endpoint, user._id, file._id.toHexString()),
      thumbnail_uri: join(
        endpoint,
        user._id,
        file._id.toHexString(),
        'thumbnail',
      ),
      createAt: now,
      updateAt: now,
    }));

    return res.send(resParsed);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:user/:fild_id')
  async sendUserFile(
    @Res() res: Response,
    @Param('user') userParam: string,
    @Param('fild_id') fileId: string,
    @UserTokenInfo() user: UserSessionDto,
  ) {
    if (userParam != user._id) throw new InvalidUserAccessException();

    const file = await this.storageService.getFileById(fileId);
    if (!file) throw new InvalidFileIdException();
    const bucket = file?.owner;
    const object = file._id + '-' + file.original_filename;
    const contentType = file.meta.contentType;
    res.setHeader('Content-Type', contentType);

    this.minioClient.client.getObject(bucket, object, (err, stream) => {
      if (err) {
        throw new InternalServerErrorException(err);
      }
      stream.on('error', streamError => {
        throw new InternalServerErrorException(streamError);
      });
      stream.on('data', chunk => {
        res.write(chunk);
      });
      stream.on('end', () => {
        res.end();
      });
    });
  }
}
