const dir = {
  included: process.env.DIRS_INCLUDED
    ? process.env.DIRS_INCLUDED.split(',')
    : [],
  excluded: process.env.DIRS_EXCLUDED
    ? process.env.DIRS_EXCLUDED.split(',')
    : [],
  root: process.env.DIRS_ROOT,
};

const repo = {
  accessToken: process.env.REPO_ACCESS_TOKEN,
  branch: process.env.REPO_BRANCH,
  name: process.env.REPO_NAME,
  owner: process.env.REPO_OWNER,
};

const redis = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number.parseInt(process.env.REDIS_PORT || '') || 6379,
  pass: process.env.REDIS_PASS,
};

const config = {
  repo,
  dir,
  redis,
};

export default config;
