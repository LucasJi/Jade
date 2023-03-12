import Head from 'next/head';
import { Avatar, Slogan, Markdown } from '../components';

export default function Home() {
  return (
    <div className="w-screen">
      <Head>
        <title>{`Lucas Ji's Blog`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* 
      <Avatar />

      <Slogan className="mt-8" /> */}

      {/* <Markdown /> */}
    </div>
  );
}
