import { CSSProperties } from 'react';
import classNames from 'classnames';

export default function VerticalLrTitle({
  title,
  onClick,
  className,
  style,
}: {
  title: string;
  onClick: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={classNames(
        'text-4xl',
        '[writing-mode:vertical-lr]',
        'hover:bg-[#ebf4ff]',
        'hover:scale-105',
        'hover:shadow',
        'hover:border',
        'hover:rounded',
        'duration-200',
        'flex',
        className,
      )}
      onClick={onClick}
      style={style}
    >
      <span className="pt-4 inline-block self-center">{title}</span>
    </div>
  );
}
