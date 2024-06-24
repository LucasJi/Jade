import { githubRequest } from './common';

const includePaths: string[] = process.env.INCLUDE_PATHS?.split(',') || [];

export const getGitTree = async (): Promise<any[]> => {
  return githubRequest('/git/trees/main?recursive=1').then(data => {
    const { tree }: { tree: any[] } = data;
    return tree.filter(value =>
      includePaths.length > 0
        ? value.type === 'blob' && value.path.endsWith('.md')
        : value.type === 'blob' &&
          value.path.endsWith('.md') &&
          includePaths.find(predicate => value.path.includes(predicate)),
    );
  });
};
