import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BaseFileMetaSchema,
  FileTypeEnum,
  ImageMeta,
  UserZoneEnum,
  VideoMeta,
  ZoneEnum,
} from 'fluentsearch-types';
import { Model, Types } from 'mongoose';
import sharp from 'sharp';
import { FileDocument, FILES_SCHEMA_NAME } from './schemas/file.schema';

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
        return {} as VideoMeta;

      default:
        throw new Error('Bad meta file parsing');
    }
  }
}
