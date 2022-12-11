import Head from 'next/head';
import Link from 'next/link';
import Markdown from '../components/markdown';

export default function Home() {
  return (
    <div>
      <Head>
        <title>{`Lucas Ji's Blog`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Markdown />
      </main>

      {/* <footer>Copyright by Lucas Ji</footer> */}
    </div>
  );
}
