import '@styles/globals.css';
import type { AppProps } from 'next/app';
import { Navbar } from 'components';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('scan posts');
  }, []);
  return (
    <div className="p-4 w-screen h-screen">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}
