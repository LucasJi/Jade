const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getNoteNames = async (): Promise<string[]> => {
  return fetch(`${baseUrl}/api/note/names`, {
    cache: 'force-cache',
    next: {
      tags: ['note:updated'],
    },
  }).then(resp => resp.json());
};

export const getNoteByName = async (name: string): Promise<string> => {
  const url = new URL(`${baseUrl}/api/note`);
  url.search = new URLSearchParams({
    name: name,
  }).toString();
  return fetch(url, {
    method: 'GET',
    cache: 'force-cache',
    next: {
      tags: ['note:updated'],
    },
  }).then(resp => resp.json());
};

export const getPreviewUrlByNameLike = async (
  name: string,
): Promise<string> => {
  const url = new URL(`${baseUrl}/api/note/preview-url`);
  url.search = new URLSearchParams({
    name: name,
  }).toString();
  return fetch(url, {
    method: 'GET',
    next: {
      tags: ['note:updated'],
    },
  }).then(resp => resp.json());
};

export const getFileTree = async () => {
  return fetch(`${baseUrl}/api/tree`, {
    next: { tags: ['note:updated'] },
  }).then(res => res.json());
};
