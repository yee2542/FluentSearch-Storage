import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FileTypeEnum, UserSessionDto } from 'fluentsearch-types';
import { MinioService } from 'nestjs-minio-client';
import sharp from 'sharp';
import getObjectStreamToBuffer from '../common/getObjectStreamToBuffer';
import { ConfigService } from '../config/config.service';
import { UserTokenInfo } from '../storage/decorators/user-token-info.decorator';
import { InvalidFileIdException } from '../storage/exceptions/invalid-file-id.exception';
import { InvalidUserAccessException } from '../storage/exceptions/invalid-user-access.exception';
import { JwtAuthGuard } from '../storage/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';

export const IMAGE_THUMBNAIL_EXTENSION = 'jpeg';

@Controller()
export class ThumbnailController {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    private readonly minioClient: MinioService,
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
    const contentType = parentFile.meta.contentType;
    res.setHeader('Content-Type', contentType);

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
      const thumbnailObjectFilename = `${thumbnailMeta._id.toHexString()}-${
        thumbnailMeta.original_filename
      }-${FileTypeEnum.ImageThumbnail}.${IMAGE_THUMBNAIL_EXTENSION}`;
      await this.minioClient.client.putObject(
        user._id,
        thumbnailObjectFilename,
        thumbnailFile,
      );
      return res.end(thumbnailFile, 'binary');
    }

    if (thumbnailExist && fileType === FileTypeEnum.Image) {
      const thumbnailObjectFilename = `${thumbnailExist._id.toHexString()}-${
        thumbnailExist.original_filename
      }-${FileTypeEnum.ImageThumbnail}.${IMAGE_THUMBNAIL_EXTENSION}`;
      const thumbnailObjFile = await getObjectStreamToBuffer(
        this.minioClient.client,
        bucket,
        thumbnailObjectFilename,
      );
      return res.end(thumbnailObjFile, 'binary');
    }

    // VIDEO THUMBNAIL
  }
}
