import '@styles/globals.css';
import type { AppProps } from 'next/app';
import { Navbar } from 'components';
import { ChakraProvider } from '@chakra-ui/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <div className="p-4 w-screen h-screen">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </ChakraProvider>
  );
}
