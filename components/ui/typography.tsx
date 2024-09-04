import { cn } from '@/lib/utils';
import { FC, type HTMLAttributes } from 'react';

export const TypographyCode: FC<HTMLAttributes<HTMLElement>> = ({
  className,
  ...props
}) => (
  <code
    className={cn(
      'relative rounded bg-muted px-[0.3rem]  py-[0.2rem]  font-mono  text-sm font-semibold',
      className,
    )}
    {...props}
  />
);
TypographyCode.displayName = 'TypographyCode';
