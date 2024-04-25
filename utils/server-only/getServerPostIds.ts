import { cache } from 'react';
import 'server-only';
import { getPostIds } from '../getPostIds';

export const preload = () => {
  void getServerPostIds();
};

export const getServerPostIds = cache(async (): Promise<string[]> => {
  console.log('server: get post ids');
  return getPostIds();
});
