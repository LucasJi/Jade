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
      <h2>404</h2>
      <span>Either this page is private or does not exist.</span>
      <Link href="/" color="foreground" underline="focus">
        Back to home page
      </Link>
    </div>
  );
}
