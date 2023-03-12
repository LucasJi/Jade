import '@styles/globals.css';
import type { AppProps } from 'next/app';
import { Navbar } from '@components';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="p-4 w-screen h-screen">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}
