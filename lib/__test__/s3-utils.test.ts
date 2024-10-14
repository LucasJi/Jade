import * as Minio from 'minio';
import { describe, test } from 'vitest';
import { getObject, listObjects } from '../s3-utils';

const bucket = 'jade-test';

const getS3Client = () =>
  new Minio.Client({
    endPoint: '139.224.248.149',
    port: 9000,
    useSSL: false,
    accessKey: '',
    secretKey: '',
  });

const minioClient = getS3Client();

describe('s3 apis', () => {
  test('listObjects', async () => {
    const result = await listObjects(minioClient, bucket);
    console.log(result);
  });

  test('getObject', async () => {
    const result = await getObject(minioClient, bucket, 'test.txt');
    console.log(result);
  });
});
