import Link from 'next/link';
import classNames from 'classnames';

export default function Navbar({ className }: { className?: string }) {
  return (
    <div
      className={classNames(
        'flex',
        'flex-row',
        'justify-end',
        'gap-8',
        'text-xl',
        className,
        'border-b',
        'items-center',
        'pr-4',
      )}
    >
      <Link href="/">Home</Link>

      <Link href="/posts">Posts</Link>

      <Link href="/posts">Roam Research</Link>
    </div>
  );
}
