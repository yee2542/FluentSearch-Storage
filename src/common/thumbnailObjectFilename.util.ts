import { FileDocument, FileTypeEnum } from 'fluentsearch-types';
import { LeanDocument } from 'mongoose';

export const IMAGE_THUMBNAIL_EXTENSION = 'jpeg';

export default (
  thumbnailMeta: FileDocument | LeanDocument<FileDocument>,
  type: FileTypeEnum,
) =>
  `${thumbnailMeta._id.toHexString()}-${
    thumbnailMeta.original_filename
  }-${type}.${IMAGE_THUMBNAIL_EXTENSION}`;
