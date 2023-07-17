import '@styles/globals.css';
import type { AppProps } from 'next/app';
import { Navbar } from 'components';
import { useEffect } from 'react';
import httpClient from '@utils/axios';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    httpClient.post('api/init').then(res => {
      const { data } = res;
      console.log('init posts', data);
    });
  }, []);

  return (
    <div className="h-screen">
      <Navbar className="h-[10%]" />
      <Component {...pageProps} />
    </div>
  );
}
