import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FileTypeEnum, UserSessionDto } from 'fluentsearch-types';
import { MinioService } from 'nestjs-minio-client';
import sharp from 'sharp';
import getObjectStreamToBuffer from '../common/getObjectStreamToBuffer';
import thumbnailObjectFilenameUtil from '../common/thumbnailObjectFilename.util';
import { ConfigService } from '../config/config.service';
import { UserTokenInfo } from '../storage/decorators/user-token-info.decorator';
import { InvalidFileIdException } from '../storage/exceptions/invalid-file-id.exception';
import { InvalidUserAccessException } from '../storage/exceptions/invalid-user-access.exception';
import { JwtAuthGuard } from '../storage/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';
import { ThumbnailService } from './thumbnail.service';

export const IMAGE_THUMBNAIL_EXTENSION = 'jpeg';

@Controller()
export class ThumbnailController {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly minioClient: MinioService,
    private readonly thumbnailService: ThumbnailService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get('/:user/:fild_id/thumbnail')
  async sendThumbnailFile(
    @Res() res: Response,
    @Param('user') userId: string,
    @Param('fild_id') fileId: string,
    @UserTokenInfo() user: UserSessionDto,
  ) {
    if (userId != user._id) throw new InvalidUserAccessException();
    const parentFile = await this.storageService.getFileById(fileId);
    if (!parentFile) throw new InvalidFileIdException();
    const bucket = parentFile?.owner;
    const object = parentFile._id + '-' + parentFile.original_filename;

    const fileType = parentFile.type;
    // check thumbnail is already create
    const thumbnailExist = await this.storageService.findFileThumbnail(fileId);

    // IMAGE THUMBNAIL
    if (!thumbnailExist && fileType === FileTypeEnum.Image) {
      const objParentFile = await getObjectStreamToBuffer(
        this.minioClient.client,
        bucket,
        object,
      );

      const objParentFileBuffer = objParentFile;
      const thumbnailFile = await sharp(objParentFileBuffer)
        .resize(200)
        .jpeg()
        .toBuffer();
      const metaParsed = await this.storageService.metaParsing(
        fileType,
        thumbnailFile,
        'image/jpeg',
      );
      const thumbnailMeta = await this.storageService.createThumbnail(
        parentFile._id,
        FileTypeEnum.ImageThumbnail,
        metaParsed,
      );

      //   upload thumbnail
      const thumbnailObjectFilename = thumbnailObjectFilenameUtil(
        thumbnailMeta,
        FileTypeEnum.ImageThumbnail,
      );
      await this.minioClient.client.putObject(
        user._id,
        thumbnailObjectFilename,
        thumbnailFile,
      );
      res.setHeader('Content-Type', 'image/jpeg');
      return res.end(thumbnailFile, 'binary');
    }
    if (thumbnailExist && fileType === FileTypeEnum.Image) {
      const thumbnailObjectFilename = thumbnailObjectFilenameUtil(
        thumbnailExist,
        FileTypeEnum.ImageThumbnail,
      );
      const thumbnailObjFile = await getObjectStreamToBuffer(
        this.minioClient.client,
        bucket,
        thumbnailObjectFilename,
      );
      res.setHeader('Content-Type', 'image/jpeg');
      return res.end(thumbnailObjFile, 'binary');
    }

    // VIDEO THUMBNAIL
    if (!thumbnailExist && FileTypeEnum.Video) {
      const videoThumbnailBuffer = await this.thumbnailService.getVideoThumbnail(
        user._id,
        parentFile._id,
      );
      res.setHeader('Content-Type', 'image/gif');
      return res.end(videoThumbnailBuffer, 'binary');
    }

    if (thumbnailExist && FileTypeEnum.Video) {
      const thumbnailObjectFilename = thumbnailObjectFilenameUtil(
        thumbnailExist,
        FileTypeEnum.VideoThumbnail,
      );
      const thumbnailObjFile = await getObjectStreamToBuffer(
        this.minioClient.client,
        bucket,
        thumbnailObjectFilename,
      );
      res.setHeader('Content-Type', 'image/gif');
      return res.end(thumbnailObjFile, 'binary');
    }

    throw new BadRequestException('Bad thumbnail access');
  }
}
