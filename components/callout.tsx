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
      'border-note/50 text-note dark:border-note [&>svg]:text-note bg-note/10',
  },
  abstract: {
    icon: ClipboardList,
    alias: ['summary', 'tldr'],
    class:
      'border-abstract/50 text-abstract dark:border-abstract [&>svg]:text-abstract bg-abstract/10',
  },
  info: {
    icon: Info,
    class:
      'border-info/50 text-info dark:border-info [&>svg]:text-info bg-info/10',
  },
  todo: {
    icon: CircleCheck,
    class:
      'border-todo/50 text-todo dark:border-todo [&>svg]:text-todo bg-todo/10',
  },
  tip: {
    icon: Flame,
    alias: ['hint', 'important'],
    class: 'border-tip/50 text-tip dark:border-tip [&>svg]:text-tip bg-tip/10',
  },
  success: {
    icon: Check,
    alias: ['check', 'done'],
    class:
      'border-success/50 text-success dark:border-success [&>svg]:text-success bg-success/10',
  },
  question: {
    icon: CircleHelp,
    alias: ['faq', 'help'],
    class:
      'border-question/50 text-question dark:border-question [&>svg]:text-question bg-question/10',
  },
  warning: {
    icon: TriangleAlert,
    alias: ['caution', 'attention'],
    class:
      'border-warning/50 text-warning dark:border-warning [&>svg]:text-warning bg-warning/10',
  },
  failure: {
    icon: X,
    alias: ['fail', 'missing'],
    class:
      'border-failure/50 text-failure dark:border-failure [&>svg]:text-failure bg-failure/10',
  },
  bug: {
    icon: Bug,
    class: 'border-bug/50 text-bug dark:border-bug [&>svg]:text-bug bg-bug/10',
  },
  danger: {
    icon: Zap,
    alias: ['error'],
    class:
      'border-danger/50 text-danger dark:border-danger [&>svg]:text-danger bg-danger/10',
  },
  example: {
    icon: List,
    class:
      'border-example/50 text-example dark:border-example [&>svg]:text-example bg-example/10',
  },
  quote: {
    icon: Quote,
    alias: ['cite'],
    class:
      'border-quote/50 text-quote dark:border-quote [&>svg]:text-quote bg-quote/10',
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
  'my-4 w-[inherit] max-w-96 rounded border p-3 pl-6 mix-blend-darken [&>summary>.lucide-chevron-right]:open:rotate-90',
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
