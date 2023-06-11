import { Avatar, Slogan } from '@components';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="w-screen">
      <Head>
        <title>{"Lucas Ji's Blog"}</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Avatar />
      <Slogan className="mt-8 text-center" />
    </div>
  );
}
