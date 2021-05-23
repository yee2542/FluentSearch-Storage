import { Injectable } from '@nestjs/common';
import { createCanvas, Image } from 'canvas';
import FFmpeg from 'fluent-ffmpeg';
import { FileDocument, FileTypeEnum } from 'fluentsearch-types';
import fs, { unlink } from 'fs';
import GIFEncoder from 'gifencoder';
import { MinioService } from 'nestjs-minio-client';
import path, { join, resolve } from 'path';
import thumbnailObjectFilenameUtil from '../common/thumbnailObjectFilename.util';
import { InvalidFileIdException } from '../storage/exceptions/invalid-file-id.exception';
import { StorageService } from '../storage/storage.service';

const TMP_DIR = 'tmp-app';
export const TMP_DIR_PATH = path.resolve(TMP_DIR);

const TMP_FILES_LISTS = (id: string) =>
  Array(9)
    .fill(0)
    .map((_e, i) => resolve(TMP_DIR_PATH, `tmp-${id}-${i + 1}.jpg`));

const EXTRACT_RESOLUTION = '480x360';
@Injectable()
export class ThumbnailService {
  constructor(
    private readonly minioClient: MinioService,
    private readonly storageService: StorageService,
  ) {}

  private async downloadVideo(
    user: string,
    parentFile: FileDocument,
  ): Promise<string> {
    const objectName = parentFile._id + '-' + parentFile.original_filename;
    const fileOutputPath = join(TMP_DIR_PATH, objectName);
    await this.minioClient.client.fGetObject(user, objectName, fileOutputPath);
    return fileOutputPath;
  }

  private deleteTempVideo(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      unlink(path, err => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  }

  private extractVideoScreenshots(
    tmpfilePath: string,
    parentFile: FileDocument,
  ) {
    return new Promise((resolve, reject) => {
      FFmpeg(tmpfilePath)
        .takeScreenshots(
          {
            filename: `tmp-${parentFile._id}-%i.jpg`,
            timemarks: [
              '10%',
              '20%',
              '30%',
              '40%',
              '50%',
              '60%',
              '70%',
              '80%',
              '90%',
              '100%',
            ],
            size: EXTRACT_RESOLUTION,
            fastSeek: true,
          },
          TMP_DIR_PATH,
        )
        .on('end', () => resolve(null))
        .on('error', err => reject(err));
    });
  }

  async getVideoThumbnail(userId: string, parentId: string) {
    const parentFile = await this.storageService.getFileById(parentId);
    if (!parentFile) throw new InvalidFileIdException();
    const tmpfilePath = await this.downloadVideo(userId, parentFile);

    await this.extractVideoScreenshots(tmpfilePath, parentFile);

    // generate gif
    const gifFilePath = await this.createGif(
      TMP_FILES_LISTS(parentFile._id),
      tmpfilePath,
    );

    // clear tmp file
    await this.deleteTempVideo(tmpfilePath);
    await this.deleteTempVideo(gifFilePath.path);
    const deleteTask = TMP_FILES_LISTS(parentFile._id).map(el =>
      this.deleteTempVideo(el),
    );
    await Promise.all(deleteTask);

    // file parsing
    const metaParsed = await this.storageService.metaParsing(
      FileTypeEnum.VideoThumbnail,
      gifFilePath.buffer,
      'image/gif',
    );
    const thumbnailMeta = await this.storageService.createThumbnail(
      parentFile._id,
      FileTypeEnum.VideoThumbnail,
      metaParsed,
    );

    //   upload thumbnail to object server
    const thumbnailObjectFilename = thumbnailObjectFilenameUtil(
      thumbnailMeta,
      FileTypeEnum.VideoThumbnail,
    );
    await this.minioClient.client.putObject(
      userId,
      thumbnailObjectFilename,
      gifFilePath.buffer,
    );

    return gifFilePath.buffer;
  }

  private async createGif(screenshots: string[], tmpPath: string) {
    const fileOutput = `${tmpPath}.gif`;
    console.log(fileOutput);
    const encoder = new GIFEncoder(480, 360);
    encoder.createReadStream().pipe(fs.createWriteStream(fileOutput));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(500);
    encoder.setQuality(10);

    const tasks = screenshots.map(async s => {
      const canvas = createCanvas(480, 360);
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = await fs.promises.readFile(s);

      ctx.drawImage(img, 0, 0);
      encoder.addFrame(ctx);
    });

    await Promise.all(tasks);
    encoder.finish();
    const buffer = Buffer.from((await fs.promises.readFile(fileOutput)).buffer);
    return {
      path: fileOutput,
      buffer,
    };
  }
}
