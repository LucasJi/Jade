import { ReactNode } from 'react';

export const Tr = ({ children }: { children: ReactNode }) => {
  return <tr className="not-prose m-0 border-t p-0">{children}</tr>;
};
