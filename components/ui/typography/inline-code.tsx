import { ReactNode } from 'react';

export const InlineCode = ({ children }: { children: ReactNode }) => {
  return (
    <code className="not-prose relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
};
