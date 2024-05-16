'use client';

import { Link } from '@nextui-org/react';

export default function NotFound() {
  return (
    <div className="w-full flex flex-col items-center h-full justify-center">
      <h2 className="text-2xl font-bold">404</h2>
      <span>Either this page is private or does not exist.</span>
      <Link href="/" color="foreground" underline="always">
        Back to home page
      </Link>
    </div>
  );
}
