import Link from 'next/link';
import classNames from 'classnames';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

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
      <GitHubLogoIcon />

      <Link href="/forceDirectedGraph">force-directed graph</Link>
    </div>
  );
}
