'use client';

import { Link } from '@nextui-org/react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl font-bold">404</h2>
      <span>Either this page is private or does not exist.</span>
      <Link href="/" color="foreground" underline="always">
        back to home page
      </Link>
    </div>
  );
}
