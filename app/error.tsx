'use client';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="flex w-full flex-col items-center">
      <span className="mt-4">{error.message}</span>
    </div>
  );
}
