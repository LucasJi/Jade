import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="flex flex-row justify-end gap-8 text-xl">
      <div>
        <Link href="/">Home</Link>
      </div>

      <div>
        <Link href="/posts">Posts</Link>
      </div>

      {/* <div>
        <Link href="/tags">Tags</Link>
      </div>

      <div>
        <Link href="/about">About</Link>
      </div> */}
    </div>
  );
}
