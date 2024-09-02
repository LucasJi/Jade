import { DetailsHTMLAttributes, forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import {
  Bug,
  Check,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  Flame,
  Info,
  List,
  Pencil,
  Quote,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react';
import { cva } from 'class-variance-authority';

interface CalloutTitleProps extends HTMLAttributes<HTMLElement> {
  title: string;
}

const CalloutTitle = forwardRef<HTMLElement, CalloutTitleProps>(
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
      <span className="ml-[4px]">{title}</span>
      <ChevronRight className="ml-3 transition-transform" size={16} />
    </summary>
  ),
);
CalloutTitle.displayName = 'CalloutTitle';

const CalloutBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn('mt-4 p-0', className)} ref={ref} {...props} />
  ),
);
CalloutBody.displayName = 'CalloutBody';

const generateVariant = (variant: string) =>
  `border-${variant}/50 text-${variant} dark:border-${variant} [&>svg]:text-${variant}`;

const variants = {
  note: {
    icon: Pencil,
  },
  abstract: {
    icon: ClipboardList,
    alias: ['summary', 'tldr'],
  },
  info: {
    icon: Info,
  },
  todo: {
    icon: CircleCheck,
  },
  tip: {
    icon: Flame,
    alias: ['hint', 'important'],
  },
  success: {
    icon: Check,
    alias: ['check', 'done'],
  },
  question: { icon: CircleHelp, alias: ['faq', 'help'] },
  warning: {
    icon: TriangleAlert,
    alias: ['caution', 'attention'],
  },
  failure: {
    icon: X,
    alias: ['fail', 'missing'],
  },
  bug: {
    icon: Bug,
  },
  danger: {
    icon: Zap,
    alias: ['error'],
  },
  example: {
    icon: List,
  },
  quote: {
    icon: Quote,
    alias: ['cite'],
  },
};

type Variants = typeof variants;

// 提取 Variant 中所有的键和值
type Variant = keyof Variants;

// 提取每个对象中的 alias 数组的元素类型
type AliasUnion<T> = T extends { alias: (infer U)[] } ? U : never;

// 提取所有 alias 的联合类型
type VariantAlias = {
  [K in keyof Variants]: AliasUnion<Variants[K]>;
}[keyof Variants];

// 合并 name 和 alias 成联合类型
type VariantType = Variant | VariantAlias | 'default';

const generateVariants = (): { [k: VariantType]: string } => {
  const result: { [k: VariantType]: string } = {};

  Object.keys(variants).forEach(k => {
    const variant = variants[k as Variant];
    result[k as VariantType] = generateVariant(k);

    if ((variant as any).alias) {
      (variant as any).alias.forEach((a: string) => {
        result[a] = generateVariant(a);
      });
    }
  });

  return result;
};

const calloutVariants = cva<{
  variant: { [k: VariantType]: string };
}>(
  'border rounded p-3 pl-6 [&>summary>.lucide-chevron-right]:open:rotate-90 w-[inherit] max-w-96 my-4',
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

const Callout = forwardRef<
  HTMLDetailsElement,
  DetailsHTMLAttributes<HTMLDetailsElement> & { variant: VariantType }
>(({ className, variant, ...props }, ref) => (
  <details
    className={cn(calloutVariants({ variant }), className)}
    ref={ref}
    {...props}
  />
));
Callout.displayName = 'Callout';

export { Callout, CalloutTitle, CalloutBody, type CalloutTitleProps };
