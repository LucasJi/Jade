const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getNoteNames = async (): Promise<string[]> => {
  return fetch(`${baseUrl}/api/note/names`, {
    cache: 'force-cache',
    next: {
      tags: ['api:note/names'],
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
  }).then(resp => resp.json());
};
