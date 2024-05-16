'use client';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="w-full flex flex-col items-center">
      <span className="mt-4">{error.message}</span>
    </div>
  );
}
