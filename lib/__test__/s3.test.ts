import {
  BucketLocationConstraint,
  CreateBucketCommand,
  CreateBucketCommandInput,
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { describe, test } from 'vitest';

const bucket = 'jade-docs';

describe('s3 apis', () => {
  const s3client = new S3Client({
    // specify endpoint with http://hostname:port
    endpoint: `http://127.0.0.1:8333`,
    // specify region since it is mandatory, but it will be ignored by seaweedfs
    region: BucketLocationConstraint.cn_north_1,
    // force path style for compatibility reasons
    forcePathStyle: true,
    // credentials is mandatory and s3 authorization should be enabled with `s3.configure`
    credentials: {
      accessKeyId: `123456`,
      secretAccessKey: `abcdef`,
    },
  });
  test('createBucket', async () => {
    const input: CreateBucketCommandInput = {
      Bucket: 'test',
      CreateBucketConfiguration: {
        LocationConstraint: BucketLocationConstraint.cn_north_1,
      },
    };

    const command = new CreateBucketCommand(input);
    const response = await s3client.send(command);
    console.log(response);
  });

  test('ListBuckets', async () => {
    const response = await s3client.send(new ListBucketsCommand({}));
    console.log(response.Buckets);
  });

  test('ListObjectsV2', async () => {
    const input: ListObjectsV2CommandInput = {
      Bucket: 'test',
      MaxKeys: 1000,
    };
    const command = new ListObjectsV2Command(input);
    const response = await s3client.send(command);
    console.log(response);
  });
});
