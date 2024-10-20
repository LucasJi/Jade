import { BucketItem } from '@/types';
import * as Minio from 'minio';
import config from './config';

export const getS3Client = () => new Minio.Client(config.s3.clientOptions);

export const listObjects =
  (s3Client: Minio.Client) =>
  async (bucket: string): Promise<BucketItem[]> => {
    const data: BucketItem[] = [];
    // @ts-ignore: https://github.com/minio/minio-js/issues/1279
    const stream = s3Client.listObjects(bucket, '', true, {
      IncludeVersion: true,
    });

    return new Promise((resolve, reject) => {
      stream.on('data', function (obj) {
        data.push(obj as BucketItem);
      });
      stream.on('end', function () {
        resolve(data);
      });
      stream.on('error', function (err) {
        reject(err);
      });
    });
  };

export const listLatestExistingObjects =
  (s3Client: Minio.Client) =>
  async (bucket: string): Promise<BucketItem[]> => {
    return listObjects(s3Client)(bucket).then(objects =>
      objects.filter(obj => obj.isLatest && !obj.isDeleteMarker),
    );
  };

export const getObject =
  (s3Client: Minio.Client) =>
  async (bucket: string, objectName: string): Promise<string> => {
    let data: string = '';
    const stream = await s3Client.getObject(bucket, objectName);

    return new Promise((resolve, reject) => {
      stream.on('data', function (chunk) {
        data += chunk.toString();
      });
      stream.on('end', function () {
        resolve(data);
      });
      stream.on('error', function (err) {
        reject(err);
      });
    });
  };
