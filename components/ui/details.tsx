import { cn } from '@/lib/utils';
import { DetailsHTMLAttributes, forwardRef, HTMLAttributes } from 'react';
import { ChevronRight, Info } from 'lucide-react';
import * as React from 'react';

const Details = forwardRef<
  HTMLDetailsElement,
  DetailsHTMLAttributes<HTMLDetailsElement>
>(({ className, ...props }, ref) => (
  <details
    className={cn(
      'py-4 w-[400px] [&>summary>.lucide-chevron-right]:open:rotate-90',
      className,
    )}
    ref={ref}
    {...props}
  />
));
Details.displayName = 'Details';

export interface SummaryProps extends HTMLAttributes<HTMLElement> {
  title: string;
}

const Summary = forwardRef<HTMLElement, SummaryProps>(
  ({ className, title, ...props }, ref) => (
    <summary
      className={cn(
        'flex items-center font-bold cursor-pointer select-none',
        className,
      )}
      ref={ref}
      {...props}
    >
      <Info size={16} />
      <span className="mx-4">{title}</span>
      <ChevronRight className="transition-transform" size={16} />
    </summary>
  ),
);
Summary.displayName = 'Summary';

export { Details, Summary };
