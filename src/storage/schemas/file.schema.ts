import { BaseFileSchema, FileTypeEnum } from 'fluentsearch-types';
import { Schema } from 'mongoose';

const fileSchema = new Schema<FileDocument>({
  meta: { type: Object },
  owner: { type: String, index: true },
  zone: { type: String, index: true },
  label: { type: String },

  createDate: { type: Date, default: Date.now, index: true },
  updateDate: { type: Date, default: Date.now, index: true },
});

export default fileSchema;

export interface FileDocument
  extends Document,
    BaseFileSchema<
      FileTypeEnum.Image | FileTypeEnum.ImageThumbnail | FileTypeEnum.Video,
      Record<'record', any>
    > {}

export const FILES_SCHEMA_NAME = 'files';
