import Link from 'next/link';

export default async function Home() {
  return (
    <div className="flex w-full  flex-col items-center">
      <Link href="/notes">notes</Link>
    </div>
  );
}
