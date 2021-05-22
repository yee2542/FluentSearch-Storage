import { FileTypeEnum } from 'fluentsearch-types';
import { InvalidMimeFileExceptiomn } from '../exceptions/invalid-mime-file.exception';

export default (mime: string) => {
  if (mime.includes('image')) return FileTypeEnum.Image;
  if (mime.includes('video')) return FileTypeEnum.Video;
  throw new InvalidMimeFileExceptiomn();
};
