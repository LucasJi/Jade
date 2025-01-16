import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/components/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        bug: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        error:
          'border-error/50 text-error dark:border-error [&>svg]:text-error',
        example:
          'border-example/50 text-example dark:border-example [&>svg]:text-example',
        fail: 'border-fail/50 text-fail dark:border-fail [&>svg]:text-fail',
        important:
          'border-important/50 text-important dark:border-important [&>svg]:text-important',
        info: 'border-info/50 text-info dark:border-info [&>svg]:text-info',
        question: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
        success: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
        summary: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
        tip: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
        todo: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
        warning: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
        quote: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
