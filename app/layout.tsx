import WebVitals from '@/components/WebVitals';
import Footer from '@/components/Footer';
import classNames from 'classnames';
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
    <html
      className={classNames('light h-full w-full scroll-smooth m-0')}
      lang="en"
    >
      <body
        className="h-full w-full flex m-0 min-h-[800px] min-w-[1080px]"
        suppressHydrationWarning={true}
      >
        <WebVitals />
        <Providers>
          <main className="w-full h-full flex-1 max-h-[calc(100%_-_100px)]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
