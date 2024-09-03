'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">404</h2>
      <span>Either this page is private or does not exist.</span>
      <Link href="/" color="foreground">
        Back to home page
      </Link>
    </div>
  );
}
