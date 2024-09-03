import {
  Children,
  cloneElement,
  DetailsHTMLAttributes,
  FC,
  forwardRef,
  HTMLAttributes,
  ReactElement,
} from 'react';
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
  LucideIcon,
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

const CalloutTitle: FC<CalloutTitleProps> = ({
  className,
  title,
  ...props
}) => {
  const variantKey: string = (props as any).variant;
  let Icon: LucideIcon = Info;

  for (const key of Object.keys(variants)) {
    const variant = variants[key as VariantKey];
    if (variantKey === key) {
      Icon = variant.icon;
      break;
    }

    if (
      (variant as any).alias &&
      ((variant as any).alias as Array<string>).includes(variantKey)
    ) {
      Icon = variant.icon;
      break;
    }
  }

  return (
    <summary
      className={cn(
        'flex items-center font-bold cursor-pointer select-none',
        className,
      )}
      {...props}
    >
      <Icon size={16} />
      <span className="ml-[4px]">{title}</span>
      <ChevronRight className="ml-3 transition-transform" size={16} />
    </summary>
  );
};

const CalloutBody: FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('mt-4 p-0', className)} {...props} />;

const generateVariant = (variant: string) =>
  `border-${variant}/50 text-${variant} dark:border-${variant} [&>svg]:text-${variant}`;

const variants = {
  note: {
    icon: Pencil,
    alias: ['default'],
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
type VariantKey = keyof Variants;

// 提取每个对象中的 alias 数组的元素类型
type AliasUnion<T> = T extends { alias: (infer U)[] } ? U : never;

// 提取所有 alias 的联合类型
type VariantAlias = {
  [K in keyof Variants]: AliasUnion<Variants[K]>;
}[keyof Variants];

// 合并 name 和 alias 成联合类型
type VariantType = VariantKey | VariantAlias;

const generateVariants = (): { [k: VariantType]: string } => {
  const result: { [k: VariantType]: string } = {};

  Object.keys(variants).forEach(k => {
    const variant = variants[k as VariantKey];
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
>(({ className, variant, children, ...props }, ref) => {
  const childrenWithProps = Children.map(children, child => {
    if ((child as ReactElement).type === CalloutTitle) {
      return cloneElement(child as ReactElement, { variant });
    }

    return child;
  });

  return (
    <details
      className={cn(calloutVariants({ variant }), className)}
      ref={ref}
      {...props}
    >
      {childrenWithProps}
    </details>
  );
});
Callout.displayName = 'Callout';

export { Callout, CalloutTitle, CalloutBody, type CalloutTitleProps };
