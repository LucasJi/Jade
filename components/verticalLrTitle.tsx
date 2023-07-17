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
        '[writing-mode:vertical-lr]',
        'hover:bg-[#ebf4ff]',
        'duration-300',
        'flex',
        'w-full',
        className,
      )}
      onClick={onClick}
      style={style}
    >
      <span className="pt-4 inline-block self-center">{title}</span>
    </div>
  );
}
