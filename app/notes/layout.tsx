import TreeView from '@/components/tree-view';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full min-w-[1200px] pt-10">
      <div className="flex w-1/4 justify-end">
        <TreeView className="max-h-[620px] w-[300px]" />
      </div>
      <div className="w-3/4">{children}</div>
    </div>
  );
}
