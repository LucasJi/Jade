import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const TypographyH1 = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    className={cn(
      'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      className,
    )}
    {...props}
  />
));
TypographyH1.displayName = 'TypographyH1';

export const TypographyH2 = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    className={cn(
      'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      className,
    )}
    {...props}
  />
));
TypographyH2.displayName = 'TypographyH2';

export const TypographyH3 = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    className={cn(
      'scroll-m-20 text-2xl font-semibold tracking-tight',
      className,
    )}
    {...props}
  />
));
TypographyH3.displayName = 'TypographyH3';

export const TypographyH4 = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    className={cn(
      'scroll-m-20 text-xl font-semibold tracking-tight',
      className,
    )}
    {...props}
  />
));
TypographyH4.displayName = 'TypographyH4';

export const TypographyH5 = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    className={cn(
      'scroll-m-20 text-lg font-semibold tracking-tight',
      className,
    )}
    {...props}
  />
));
TypographyH5.displayName = 'TypographyH5';

export const TypographyH6 = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h6
    className={cn(
      'scroll-m-20 text-base font-semibold tracking-tight',
      className,
    )}
    {...props}
  />
));
TypographyH6.displayName = 'TypographyH6';

export const TypographyCode = forwardRef<
  HTMLElement,
  HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <code
    className={cn(
      'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
      className,
    )}
    {...props}
  />
));
TypographyCode.displayName = 'TypographyCode';

export const TypographyP = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    className={cn('leading-7 [&:not(:first-child)]:mt-6', className)}
    {...props}
  />
));
TypographyP.displayName = 'TypographyP';
