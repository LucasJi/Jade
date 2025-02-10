import { TreeViewNode } from '@/components/types';
import { Root } from 'hast';
import { ListItem } from 'mdast';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getNotePaths = async (): Promise<string[]> => {
  return fetch(`${baseUrl}/api/note/paths`).then(resp => resp.json());
};

export const getHastByPath = async (path: string): Promise<Root> => {
  const url = new URL(`${baseUrl}/api/note`);
  url.search = new URLSearchParams({
    path: path,
  }).toString();
  return fetch(url, {
    method: 'GET',
  }).then(resp => resp.json());
};

export const getNoteHeadingByPath = async (
  path: string,
): Promise<ListItem[]> => {
  const url = new URL(`${baseUrl}/api/note/heading`);
  url.search = new URLSearchParams({
    path: path,
  }).toString();
  return fetch(url, {
    method: 'GET',
  }).then(resp => resp.json());
};

export const revalidate = async (path: string) => {
  const url = new URL(`${baseUrl}/api/revalidate`);
  url.search = new URLSearchParams({
    path: path,
  }).toString();
  return fetch(url, {
    method: 'GET',
  }).then(resp => resp.json());
};

export const getFileTree = async (): Promise<TreeViewNode[]> => {
  return fetch(`${baseUrl}/api/tree`).then(res => res.json());
};

export const search = async (content: string) => {
  const url = new URL(`${baseUrl}/api/search`);
  url.search = new URLSearchParams({
    content,
  }).toString();
  return fetch(url).then(res => res.json());
};

export const getNoteVaultPathByRoutePath = async (
  routePath: string,
): Promise<{
  data: string;
}> => {
  const url = new URL(`${baseUrl}/api/note/vault-path`);
  url.search = new URLSearchParams({
    routePath,
  }).toString();
  return fetch(url).then(res => res.json());
};
