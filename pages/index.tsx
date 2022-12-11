import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>{`Lucas Ji's Blog`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>Welcome to my blog!(WIP...)</main>

      {/* <footer>Copyright by Lucas Ji</footer> */}
    </div>
  );
}
