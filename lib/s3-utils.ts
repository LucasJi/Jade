import { PathItem } from '@types';
import * as Minio from 'minio';
import { ext } from './utils';

const getS3Client = (params: Minio.ClientOptions) => new Minio.Client(params);

const listObjects = async (
  minioClient: Minio.Client,
  bucket: string,
): Promise<PathItem[]> => {
  const data: PathItem[] = [];
  // @ts-ignore: https://github.com/minio/minio-js/issues/1279
  const stream = minioClient.listObjects(bucket, '', true, {
    IncludeVersion: true,
  });

  return new Promise((resolve, reject) => {
    stream.on('data', function (obj) {
      // @ts-ignore
      if (obj.isLatest && !obj.isDeleteMarker) {
        data.push({
          id: obj.name || '',
          path: obj.name || '',
          type: 'blob',
          ext: ext(obj.name || ''),
        });
      }
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
) => {
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
