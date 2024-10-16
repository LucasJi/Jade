import { BucketItem } from '@/types';
import * as Minio from 'minio';

const getS3Client = (params: Minio.ClientOptions) => new Minio.Client(params);

const listObjects = async (
  minioClient: Minio.Client,
  bucket: string,
): Promise<BucketItem[]> => {
  const data: BucketItem[] = [];
  // @ts-ignore: https://github.com/minio/minio-js/issues/1279
  const stream = minioClient.listObjects(bucket, '', true, {
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

const getObject = async (
  minioClient: Minio.Client,
  bucket: string,
  objectName: string,
): Promise<string> => {
  let data: string = '';
  const stream = await minioClient.getObject(bucket, objectName);

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

export { getObject, getS3Client, listObjects };
