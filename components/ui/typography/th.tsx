import { ReactNode } from 'react';

export const Th = ({ children }: { children: ReactNode }) => {
  return (
    <th className="not-prose border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  );
};
