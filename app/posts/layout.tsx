import Tree from '@/components/tree';
import { getPostTree } from '@/utils/getPostTree';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  const postTree = await getPostTree();
  return (
    <div className="flex h-full w-full pt-10">
      <div className="w-1/4 flex justify-end">
        <Tree data={postTree} className="w-[300px] max-h-[820px]" />
      </div>
      <div className="w-3/4">{children}</div>
    </div>
  );
}
