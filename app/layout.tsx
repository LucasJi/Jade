import WebVitals from '@/components/WebVitals';
import Footer from '@/components/Footer';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';
import clsx from 'clsx';

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={clsx('light h-full w-full scroll-smooth m-0')}
      lang="en"
    >
      <body className="h-full w-full flex m-0 min-h-[800px] min-w-[1080px]">
        <WebVitals />
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <main className="w-full h-full flex-1 max-h-[calc(100%_-_100px)]">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
