/* eslint-disable no-console */

import { revalidateTag } from 'next/cache';
import { PathItem } from '@types';
import { MD_EXT } from '@/lib/constants';
import { env } from '@/lib/env';

export const githubRequest = (url: string, tag: string = '') =>
  fetch(
    `https://api.github.com/repos/${env.repo.owner}/${env.repo.name}${url}`,
    {
      // cache: 'no-cache',
      headers: {
        Accept: 'application/vnd.github.object+json',
        Authorization: `Bearer ${env.repo.accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: {
        tags: [tag],
      },
    },
  )
    .then(async resp => {
      if (resp.status !== 200) {
        const msg = await resp.text();
        console.error('github api request failed', resp.status, msg);
        throw new Error('github api request failed: ' + msg);
      }
      return resp.json();
    })
    .catch(e => {
      console.error('github api request failed', e);
      revalidateTag(tag);
    });

export const getGitTree = async (): Promise<PathItem[]> => {
  return githubRequest(`/git/trees/${env.repo.branch}?recursive=1`).then(
    data => {
      const { tree }: { tree: any[] } = data;
      return tree.filter(value =>
        env.dir.included.length <= 0
          ? value.type === 'blob' && value.path.endsWith(MD_EXT)
          : value.type === 'blob' &&
            value.path.endsWith(MD_EXT) &&
            env.dir.included.find(predicate => value.path.includes(predicate)),
      );
    },
  );
};
