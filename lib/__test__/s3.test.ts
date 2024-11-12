import * as Minio from 'minio';
import { describe, test } from 'vitest';
import { getObject, listObjects } from '../server/s3';

const bucket = 'jade-docs';

const getS3Client = () =>
  new Minio.Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: '',
    secretKey: '',
  });

const minioClient = getS3Client();

describe('s3 apis', () => {
  test('listObjects', async () => {
    const result = await listObjects(minioClient)(bucket);
    console.log(result);
  });

  test('getObject', async () => {
    const result = await getObject(minioClient)(bucket, 'Kanban.md');
    console.log(result);
  });
});
