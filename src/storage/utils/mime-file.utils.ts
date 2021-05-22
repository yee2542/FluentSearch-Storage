import { FileTypeEnum } from 'fluentsearch-types';
import { InvalidMimeFileException } from '../exceptions/invalid-mime-file.exception';

export default (mime: string): FileTypeEnum => {
  if (mime.includes('image')) return FileTypeEnum.Image;
  if (mime.includes('video')) return FileTypeEnum.Video;
  throw new InvalidMimeFileException();
};
