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

const env = {
  repo,
  dir,
};

export { env };
