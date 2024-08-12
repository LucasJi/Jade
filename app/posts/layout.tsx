import Tree from '@/components/tree';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full pt-10">
      <div className="w-1/4 flex justify-end">
        <Tree className="w-[300px] max-h-[620px]" />
      </div>
      <div className="w-3/4">{children}</div>
    </div>
  );
}
