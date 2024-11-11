import { BucketItem, NoteObject } from '@/lib/types';
import { getFileExt } from '@/lib/utils';
import { Client } from 'minio';
import config from '../config';

export const getS3Client = () => new Client(config.s3.clientOptions);

export const listObjects =
  (s3Client: Client) =>
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
  (s3Client: Client) =>
  async (bucket: string): Promise<BucketItem[]> => {
    return listObjects(s3Client)(bucket).then(objects =>
      objects.filter(obj => obj.isLatest && !obj.isDeleteMarker),
    );
  };

export const getObject =
  (s3Client: Client) =>
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

const listNoteObjectsRemotely = async (
  s3Client: Client,
  excluded: string[],
): Promise<NoteObject[]> => {
  return listLatestExistingObjects(s3Client)(config.s3.bucket).then(objs =>
    objs
      .filter(obj => !excluded.includes(obj.name.split('/')[0]))
      .map(obj => ({
        name: obj.name,
        ext: getFileExt(obj.name),
        type: 'file',
      })),
  );
};

export const listNoteObjects = async (
  s3Client: Client,
): Promise<NoteObject[]> => {
  // if (dir.root) {
  //   log.info(
  //     `Load vault from local dir: ${dir.root}. Those folders will be ignored: ${dir.excluded}`,
  //   );
  //   return loadLocalVaultFilePathItems(dir.root, dir.root, dir.excluded);
  // }

  return listNoteObjectsRemotely(s3Client, config.dir.excluded).then(objs => {
    return objs;
  });
};
