import TreeView from '@/components/tree-view';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <TreeView className="fixed left-4 top-0" />
      {children}
    </div>
  );
}
