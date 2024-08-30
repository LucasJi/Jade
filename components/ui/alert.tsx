import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const generateVariant = (variant: string) =>
  `border-${variant}/50 text-${variant} dark:border-${variant} [&>svg]:text-${variant}`;

enum Variant {
  destructive,
  bug,
  error,
  example,
  fail,
  important,
  info,
  question,
  success,
  summary,
  tip,
  todo,
  warning,
  quote,
}

type VariantType = keyof typeof Variant;

const generateVariants = () => {
  const variants: Partial<Record<VariantType, any>> = {};
  const stringKeys = Object.keys(Variant).filter(v => isNaN(Number(v)));
  Object.keys(Variant)
    .filter(v => isNaN(Number(v)))
    .forEach(k => {
      variants[k as VariantType] = generateVariant(k);
    });

  return variants;
};

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        ...generateVariants(),
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

export { Alert, AlertTitle, AlertDescription };
