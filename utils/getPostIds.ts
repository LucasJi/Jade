import { githubRequest } from './common';

export const getPostIds = (): Promise<string[]> => {
  return githubRequest('/git/trees/main?recursive=1').then(data => {
    const { tree }: { tree: any[] } = data;

    return tree
      .filter(value => value.type === 'blob' && value.path.endsWith('.md'))
      .map(value => btoa(value.path));
  });
};
