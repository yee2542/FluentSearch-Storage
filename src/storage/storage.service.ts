import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import FFmpeg from 'fluent-ffmpeg';
import {
  BaseFileMetaSchema,
  FileDocument,
  FILES_SCHEMA_NAME,
  FileTypeEnum,
  ImageMeta,
  UserZoneEnum,
  VideoMeta,
  ZoneEnum,
} from 'fluentsearch-types';
import { LeanDocument, Model, Types } from 'mongoose';
import sharp from 'sharp';
import { Readable } from 'stream';
import { InvalidFileIdException } from './exceptions/invalid-file-id.exception';

@Injectable()
export class StorageService {
  constructor(
    @InjectModel(FILES_SCHEMA_NAME)
    private readonly fileModel: Model<FileDocument>,
  ) {}

  async getFileById(id: string) {
    return this.fileModel.findById(id);
  }

  async createMeta(data: {
    _id: Types.ObjectId;
    owner: string;
    original_filename: string;
    type: FileTypeEnum;
    zone: ZoneEnum | UserZoneEnum;
    meta: Record<string, any>;
  }): Promise<FileDocument> {
    const doc = new this.fileModel(data);
    return doc.save();
  }

  private async getVideoMeta(buffer: Buffer) {
    return new Promise<FFmpeg.FfprobeData>((resolve, reject) => {
      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);

      FFmpeg({ source: readable }).ffprobe((err, metadata) => {
        if (err) return reject(err);
        resolve(metadata);
      });
    });
  }

  async metaParsing(
    type: FileTypeEnum,
    buffer: Buffer,
    contentType: string,
  ): Promise<BaseFileMetaSchema<ImageMeta> | VideoMeta> {
    switch (type) {
      case FileTypeEnum.Image:
        const imageMeta = await sharp(buffer).metadata();
        return {
          width: imageMeta.width,
          height: imageMeta.height,
          size: imageMeta.size,
          extension: imageMeta.format,
          contentType,
        } as BaseFileMetaSchema<ImageMeta>;
      case FileTypeEnum.Video:
        const videoMeta = await this.getVideoMeta(buffer);
        const duration = Number(videoMeta.streams[0].duration);
        const formatDuration = new Date(duration * 1000)
          .toISOString()
          .substr(11, 8);
        const [hour, minute, second] = formatDuration.split(':');
        return {
          width: videoMeta.streams[0].width,
          height: videoMeta.streams[0].height,
          size: buffer.buffer.byteLength,
          extension: videoMeta.format.format_name?.split(',')[0].trim(),
          contentType,
          fps:
            Number(videoMeta.streams[0].avg_frame_rate?.split('/')[0]) /
            Number(videoMeta.streams[0].avg_frame_rate?.split('/')[1]),

          codec: videoMeta.streams[0].codec_name,
          bitrate: Number(videoMeta.streams[0].bit_rate),
          duration: {
            original: duration.toString(),
            hour: Number(hour),
            minute: Number(minute),
            second: Number(second),
          },

          audio: {
            channel: videoMeta.streams[1].channels,
            bitrate: Number(videoMeta.streams[1].bit_rate),
            codec: videoMeta.streams[1].codec_name,
          },
        } as BaseFileMetaSchema<VideoMeta>;

      default:
        throw new Error('Bad meta file parsing');
    }
  }

  async findFileThumbnail(fileId: string): Promise<LeanDocument<FileDocument>> {
    const file = await this.fileModel.findOne({ refs: fileId }).lean();
    if (!file) throw new InvalidFileIdException();
    return file;
  }
}
