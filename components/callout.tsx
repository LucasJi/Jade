import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
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
import {
  Children,
  DetailsHTMLAttributes,
  FC,
  HTMLAttributes,
  ReactElement,
  cloneElement,
} from 'react';

interface CalloutTitleProps extends HTMLAttributes<HTMLElement> {
  title: string;
  variant?: VariantType;
  isFoldable?: boolean;
}

const CalloutTitle: FC<CalloutTitleProps> = ({
  className,
  title,
  variant,
  isFoldable,
}) => {
  const variantKey = variant || 'default';
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

  const _className = cn(
    'flex select-none items-center font-bold',
    { 'cursor-pointer': isFoldable },
    className,
  );

  return isFoldable ? (
    <summary className={_className}>
      <Icon size={16} />
      <span className="ml-[4px]">{title}</span>
      <ChevronRight className="ml-3 transition-transform" size={16} />
    </summary>
  ) : (
    <div className={_className}>
      <Icon size={16} />
      <span className="ml-[4px]">{title}</span>
    </div>
  );
};

const CalloutBody: FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('mt-4 p-0', className)} {...props} />;

const variants = {
  note: {
    icon: Pencil,
    alias: ['default'],
    class:
      'border-note/50 dark:border-note [&>*:first-child]:text-note bg-note/10',
  },
  abstract: {
    icon: ClipboardList,
    alias: ['summary', 'tldr'],
    class:
      'border-abstract/50 dark:border-abstract [&>*:first-child]:text-abstract bg-abstract/10',
  },
  info: {
    icon: Info,
    class:
      'border-info/50 dark:border-info [&>*:first-child]:text-info bg-info/10',
  },
  todo: {
    icon: CircleCheck,
    class:
      'border-todo/50 dark:border-todo [&>*:first-child]:text-todo bg-todo/10',
  },
  tip: {
    icon: Flame,
    alias: ['hint', 'important'],
    class: 'border-tip/50 dark:border-tip [&>*:first-child]:text-tip bg-tip/10',
  },
  success: {
    icon: Check,
    alias: ['check', 'done'],
    class:
      'border-success/50 dark:border-success [&>*:first-child]:text-success bg-success/10',
  },
  question: {
    icon: CircleHelp,
    alias: ['faq', 'help'],
    class:
      'border-question/50 dark:border-question [&>*:first-child]:text-question bg-question/10',
  },
  warning: {
    icon: TriangleAlert,
    alias: ['caution', 'attention'],
    class:
      'border-warning/50 dark:border-warning [&>*:first-child]:text-warning bg-warning/10',
  },
  failure: {
    icon: X,
    alias: ['fail', 'missing'],
    class:
      'border-failure/50 dark:border-failure [&>*:first-child]:text-failure bg-failure/10',
  },
  bug: {
    icon: Bug,
    class: 'border-bug/50 dark:border-bug [&>*:first-child]:text-bug bg-bug/10',
  },
  danger: {
    icon: Zap,
    alias: ['error'],
    class:
      'border-danger/50 dark:border-danger [&>*:first-child]:text-danger bg-danger/10',
  },
  example: {
    icon: List,
    class:
      'border-example/50 dark:border-example [&>*:first-child]:text-example bg-example/10',
  },
  quote: {
    icon: Quote,
    alias: ['cite'],
    class:
      'border-quote/50 dark:border-quote [&>*:first-child]:text-quote bg-quote/10',
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
    result[k as VariantType] = variant.class;

    if ((variant as any).alias) {
      (variant as any).alias.forEach((a: string) => {
        result[a] = variant.class;
      });
    }
  });

  return result;
};

const calloutVariants = cva<{
  variant: { [k: VariantType]: string };
}>(
  'my-4 w-[inherit] rounded border p-3 pl-6 mix-blend-darken [&>summary>.lucide-chevron-right]:open:rotate-90',
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

const Callout: FC<
  HTMLAttributes<HTMLDivElement> & {
    variant: VariantType;
    isFoldable?: boolean;
    defaultFolded?: boolean;
  }
> = ({
  className,
  variant,
  isFoldable = false,
  defaultFolded,
  children,
  ...props
}) => {
  const childrenWithProps = Children.map(children, child => {
    if ((child as ReactElement).type === CalloutTitle) {
      return cloneElement(child as ReactElement, {
        // @ts-ignore
        variant,
        isFoldable,
      });
    }

    return child;
  });
  const _className = cn(calloutVariants({ variant }), className);
  return isFoldable ? (
    <details
      className={_className}
      open={
        defaultFolded ??
        (props as DetailsHTMLAttributes<HTMLDetailsElement>).open
      }
    >
      {childrenWithProps}
    </details>
  ) : (
    <div className={_className}>{childrenWithProps}</div>
  );
};
Callout.displayName = 'Callout';

export { Callout, CalloutBody, CalloutTitle, type CalloutTitleProps };
