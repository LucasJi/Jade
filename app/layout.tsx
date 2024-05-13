import WebVitals from '@/components/WebVitals';
import Footer from '@components/Footer';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="light h-full w-full scroll-smooth m-0" lang="en">
      <body
        className="h-full w-full flex m-0 min-h-[800px]"
        suppressHydrationWarning={true}
      >
        <WebVitals />
        <Providers>
          <main className="w-full h-full flex-1 max-h-[calc(100%_-_100px)] overflow-y-auto">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
