import { MinioService } from 'nestjs-minio-client';

export default (
  client: MinioService['client'],
  bucket: string,
  object: string,
) => {
  const buffer: Array<any> = [];
  return new Promise<Buffer>(async (resolve, reject) => {
    const objFile = await client.getObject(bucket, object);

    objFile.on('error', err => reject(err));
    objFile.on('data', chunk => buffer.push(chunk));
    objFile.on('end', () => resolve(Buffer.concat(buffer)));
  });
};
