import type { ClientOptions } from 'minio';

const _env = process.env;

const dir = {
  included: _env.DIRS_INCLUDED ? _env.DIRS_INCLUDED.split(',') : [],
  excluded: _env.DIRS_EXCLUDED ? _env.DIRS_EXCLUDED.split(',') : [],
  root: _env.DIRS_ROOT,
};

const repo = {
  accessToken: _env.REPO_ACCESS_TOKEN,
  branch: _env.REPO_BRANCH,
  name: _env.REPO_NAME,
  owner: _env.REPO_OWNER,
};

const redis = {
  host: _env.REDIS_HOST || '127.0.0.1',
  port: Number.parseInt(_env.REDIS_PORT || '') || 6379,
  pass: _env.REDIS_PASS,
};

interface S3 {
  clientOptions: ClientOptions;
  bucket: string;
}

const s3: S3 = {
  clientOptions: {
    endPoint: _env.S3_ENDPOINT || '',
    port: 9000,
    useSSL: false,
    accessKey: _env.S3_ACCESS_KEY || '',
    secretKey: _env.S3_SECRET_KEY || '',
  },
  bucket: _env.S3_BUCKET || '',
};

const env = {
  repo,
  dir,
  redis,
  s3,
};

export { env };
