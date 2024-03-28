import Tree from '@components/Tree';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  const postTree = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/tree`,
    {
      method: 'GET',
    },
  ).then(resp => resp.json());

  return (
    <div className="flex w-full h-full">
      <div className="w-1/5 p-4">
        <Tree data={postTree} />
      </div>
      <div className="w-4/5">{children}</div>
    </div>
  );
}
