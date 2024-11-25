export const getNoteNames = async (): Promise<string[]> => {
  return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/note/names`, {
    cache: 'force-cache',
    next: {
      tags: ['api:note/names'],
    },
  }).then(resp => resp.json());
};
