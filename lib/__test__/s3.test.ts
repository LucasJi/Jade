import { describe, test } from 'vitest';
import { S3 } from '../server/s3';

const bucket = 'jade-docs';

describe('s3 apis', () => {
  const s3 = new S3();
  test('listObjects', async () => {
    const result = await s3.listObjects(bucket);
    console.log(result);
  });

  test('getObject', async () => {
    const result = await s3.getObject(bucket, 'Kanban.md');
    console.log(result);
  });
});
