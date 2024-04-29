import { createFetch } from './common';

export const getPostIds = (): Promise<string[]> => {
  return createFetch('/git/trees/main?recursive=1')
    .then(resp => resp.json())
    .then(data => {
      const { tree }: { tree: any[] } = data;

      return tree
        .filter(value => value.type === 'blob' && value.path.endsWith('.md'))
        .map(value => btoa(value.path));
    });
};
