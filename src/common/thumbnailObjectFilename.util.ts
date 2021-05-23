import { FileDocument, FileTypeEnum } from 'fluentsearch-types';
import { LeanDocument } from 'mongoose';

export const IMAGE_THUMBNAIL_EXTENSION = 'jpeg';
export const VIDEO_THUMBNAIL_EXTENSION = 'gif';

export default (
  thumbnailMeta: FileDocument | LeanDocument<FileDocument>,
  type: FileTypeEnum,
) =>
  `${thumbnailMeta._id.toHexString()}-${
    thumbnailMeta.original_filename
  }-${type}.${
    thumbnailMeta.type === FileTypeEnum.ImageThumbnail
      ? IMAGE_THUMBNAIL_EXTENSION
      : VIDEO_THUMBNAIL_EXTENSION
  }`;
