'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <h2 className="text-3xl font-bold">404</h2>
      <span className="mt-4">
        Either this page is private or does not exist.
      </span>
      <Link href="/" color="foreground" className="underline">
        Back to home
      </Link>
    </div>
  );
}
