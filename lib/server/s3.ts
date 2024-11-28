import { BucketItem } from '@/lib/types';
import { Client } from 'minio';
import config from '../config';

export class S3 {
  _bucket: string;

  constructor() {
    this._client = new Client(config.s3.clientOptions);
    this._bucket = config.s3.bucket;
  }

  _client: Client;

  get client(): Client {
    return this._client;
  }

  async listObjects(): Promise<BucketItem[]> {
    const data: BucketItem[] = [];
    // @ts-ignore: https://github.com/minio/minio-js/issues/1279
    const stream = this._client.listObjects(this._bucket, '', true, {
      IncludeVersion: true,
    });

    return new Promise((resolve, reject) => {
      stream.on('data', function (obj: BucketItem) {
        data.push(obj as BucketItem);
      });
      stream.on('end', function () {
        resolve(data);
      });
      stream.on('error', function (err: any) {
        reject(err);
      });
    });
  }

  async getObject(objectName: string): Promise<string> {
    let data: string = '';
    const stream = await this._client.getObject(this._bucket, objectName);

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
  }

  async presignedGetObject(
    objectName: string,
    expiry?: number,
  ): Promise<string> {
    return await this._client.presignedGetObject(
      this._bucket,
      objectName,
      expiry ?? 24 * 60 * 60,
    );
  }
}
