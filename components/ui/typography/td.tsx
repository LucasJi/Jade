import { ReactNode } from 'react';

export const Td = ({ children }: { children: ReactNode }) => {
  return (
    <td className="not-prose border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  );
};
