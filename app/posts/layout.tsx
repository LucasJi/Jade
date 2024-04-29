import Tree from '@components/Tree';
import { getPostTree } from '@utils/getPostTree';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  const postTree = await getPostTree();
  return (
    <div className="flex w-full h-full py-10">
      <div className="w-1/4 flex justify-end">
        <Tree data={postTree} className="w-[300px]" />
      </div>
      <div className="w-3/4">{children}</div>
    </div>
  );
}
