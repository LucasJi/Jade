import { base64Encode } from './common';
import { getGitTree } from './getGitTree';

export const getPostIds = async (): Promise<string[]> => {
  return getGitTree().then(tree => {
    return tree.map(value => base64Encode(value.path));
  });
};
