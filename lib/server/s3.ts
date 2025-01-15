import {
  BucketLocationConstraint,
  GetObjectCommand,
  GetObjectCommandInput,
  GetObjectCommandOutput,
  ListObjectVersionsCommand,
  ListObjectVersionsCommandInput,
  ListObjectVersionsCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { StreamingBlobPayloadOutputTypes } from '@smithy/types';
import config from '../config';

export class S3 {
  _bucket: string;

  constructor() {
    this._client = new S3Client({
      endpoint: `${config.s3.endpoint}`,
      region: BucketLocationConstraint.cn_north_1,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      },
    });
    this._bucket = config.s3.bucket;
  }

  _client: S3Client;

  get client(): S3Client {
    return this._client;
  }

  async listObjectVersions(): Promise<ListObjectVersionsCommandOutput> {
    const input: ListObjectVersionsCommandInput = {
      Bucket: this._bucket,
      Prefix: '',
    };
    const command = new ListObjectVersionsCommand(input);
    return await this._client.send(command);
  }

  async getObject(
    path: string,
  ): Promise<StreamingBlobPayloadOutputTypes | undefined> {
    const input: GetObjectCommandInput = {
      Bucket: this._bucket,
      Key: path,
    };
    const command = new GetObjectCommand(input);
    const response: GetObjectCommandOutput = await this._client.send(command);
    return response.Body;
  }
}
