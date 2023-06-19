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
      <div>
        <Link href="/">Home</Link>
      </div>

      <div>
        <Link href="/posts">Posts</Link>
      </div>

      <div>
        <Link href="/posts">Roam Research</Link>
      </div>
    </div>
  );
}
