import {
  BucketLocationConstraint,
  BucketVersioningStatus,
  CreateBucketCommand,
  CreateBucketCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectVersionsCommand,
  ListObjectVersionsCommandInput,
  PutBucketVersioningCommand,
  PutBucketVersioningCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { describe, test } from 'vitest';

const bucket = 'test';
const key = 's3UploadTestFile.txt';

describe('s3 apis', () => {
  const client = new S3Client({
    endpoint: 'http://127.0.0.1:9000',
    region: BucketLocationConstraint.cn_north_1,
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'BfXrvWd59Q6rXwT8Ev5f',
      secretAccessKey: 'KNC6jkig4fAH0GEu0G3FJLdImBNhBNNMhIB8oqtt',
    },
  });

  test('CreateBucket', async () => {
    const input: CreateBucketCommandInput = {
      Bucket: 'test',
      CreateBucketConfiguration: {
        LocationConstraint: BucketLocationConstraint.cn_north_1,
      },
    };

    const command = new CreateBucketCommand(input);
    const response = await client.send(command);
    console.log(response);
  });

  test('EnableBucketVersioning', async () => {
    const input: PutBucketVersioningCommandInput = {
      Bucket: bucket,
      VersioningConfiguration: {
        Status: BucketVersioningStatus.Enabled,
      },
    };
    const command = new PutBucketVersioningCommand(input);
    const response = await client.send(command);
    console.log(response);
  });

  test('ListBuckets', async () => {
    const response = await client.send(new ListBucketsCommand({}));
    console.log(response.Buckets);
  });

  test('PutObject', async () => {
    const input: PutObjectCommandInput = {
      Body: 'filetoupload',
      Bucket: bucket,
      Key: key,
    };
    const command = new PutObjectCommand(input);
    const response = await client.send(command);
    console.log(response);
  });

  test('ListObjectVersions', async () => {
    const input: ListObjectVersionsCommandInput = {
      Bucket: bucket,
      Prefix: '',
    };
    const command = new ListObjectVersionsCommand(input);
    const response = await client.send(command);
    console.log(response);
  });

  test('ListObjectsV2', async () => {
    const input: ListObjectsV2CommandInput = {
      Bucket: bucket,
      MaxKeys: 1000,
    };
    const command = new ListObjectsV2Command(input);
    const response = await client.send(command);
    console.log(response);
  });

  test('GetObject', async () => {
    const input: GetObjectCommandInput = {
      Bucket: bucket,
      Key: key,
    };
    const command = new GetObjectCommand(input);
    try {
      const response: GetObjectCommandOutput = await client.send(command);
      const result = await response.Body?.transformToString();
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  });
});
