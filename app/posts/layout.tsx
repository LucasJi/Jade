import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  return <div className="flex w-full h-full py-10">{children}</div>;
}
