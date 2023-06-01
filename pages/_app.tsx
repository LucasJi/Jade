import '@styles/globals.css';
import type { AppProps } from 'next/app';
import { Navbar } from 'components';
import { useEffect } from 'react';
import httpClient from '@utils/axios';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    httpClient.post('api/init').then(resp => {
      const { data } = resp;
      console.log(data);
    });
    console.log('scan posts');
  }, []);
  return (
    <div className="p-4 w-screen h-screen">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
}
