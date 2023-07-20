import { Avatar, Slogan } from '@components';
import Head from 'next/head';
import React from 'react';

export default function Home() {
  return (
    <div className="flex-col">
      <Head>
        <title>{"Lucas Ji's Blog"}</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Avatar className="self-center" />
      <Slogan className="mt-8 text-center self-center" />
    </div>
  );
}
