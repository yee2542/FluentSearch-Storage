import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileTypeEnum } from 'fluentsearch-types';
import { MinioService } from 'nestjs-minio-client';
import sharp from 'sharp';
import getObjectStreamToBuffer from '../common/getObjectStreamToBuffer';
import thumbnailObjectFilenameUtil from '../common/thumbnailObjectFilename.util';
import { InvalidFileIdException } from '../storage/exceptions/invalid-file-id.exception';
import { StorageService } from '../storage/storage.service';
import { ThumbnailService } from './thumbnail.service';

export const THUMBNAIL_SIZE = 300;

@Controller()
export class ThumbnailController {
  constructor(
    private readonly storageService: StorageService,
    private readonly minioClient: MinioService,
    private readonly thumbnailService: ThumbnailService,
  ) {}
  // @UseGuards(JwtAuthGuard)
  @Get('/:user/:fild_id/thumbnail')
  async sendThumbnailFile(
    @Res() res: Response,
    @Param('user') userId: string,
    @Param('fild_id') fileId: string,
    // @UserTokenInfo() user: UserSessionDto,
  ) {
    try {
      // if (userId != user._id) throw new InvalidUserAccessException();
      const parentFile = await this.storageService.getFileById(fileId);
      if (!parentFile) throw new InvalidFileIdException();
      const bucket = parentFile?.owner;
      const object = parentFile._id + '-' + parentFile.original_filename;

      const fileType = parentFile.type;
      // check thumbnail is already create
      const thumbnailExist = await this.storageService.findFileThumbnail(
        fileId,
      );

      // IMAGE THUMBNAIL
      if (!thumbnailExist && fileType === FileTypeEnum.Image) {
        const objParentFile = await getObjectStreamToBuffer(
          this.minioClient.client,
          bucket,
          object,
        );

        const objParentFileBuffer = objParentFile;
        const thumbnailFile = await sharp(objParentFileBuffer)
          .resize(THUMBNAIL_SIZE)
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
          userId,
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
          userId,
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
    } catch (err) {
      Logger.error(err);
      throw new InternalServerErrorException(JSON.stringify(err));
    }
  }
}
