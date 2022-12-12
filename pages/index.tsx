import Head from 'next/head';
import { Avatar, Slogan } from '@components';

export default function Home() {
  return (
    <div className="">
      <Head>
        <title>{`Lucas Ji's Blog`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <main>
        <Markdown />
      </main> */}

      <Avatar />

      <Slogan />

      {/* <footer>Copyright by Lucas Ji</footer> */}
    </div>
  );
}
