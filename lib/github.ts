/* eslint-disable no-console */

import { config } from '@/lib/config';
import { MD_EXT } from '@/lib/constants';
import { NoteObject } from '@types';
import { revalidateTag } from 'next/cache';

export const githubRequest = (url: string, tag: string = '') =>
  fetch(
    `https://api.github.com/repos/${config.repo.owner}/${config.repo.name}${url}`,
    {
      // cache: 'no-cache',
      headers: {
        Accept: 'application/vnd.github.object+json',
        Authorization: `Bearer ${config.repo.accessToken}`,
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

export const getGitTree = async (): Promise<NoteObject[]> => {
  return githubRequest(`/git/trees/${config.repo.branch}?recursive=1`).then(
    data => {
      const { tree }: { tree: any[] } = data;
      return tree.filter(value =>
        config.dir.included.length <= 0
          ? value.type === 'blob' && value.path.endsWith(MD_EXT)
          : value.type === 'blob' &&
            value.path.endsWith(MD_EXT) &&
            config.dir.included.find(predicate =>
              value.path.includes(predicate),
            ),
      );
    },
  );
};
