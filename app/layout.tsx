import WebVitals from '@/components/webVitals';
import '@/styles/globals.css';
// import { Noto_Sans_SC } from 'next/font/google';
import localFont from 'next/font/local';
import { ReactNode } from 'react';
import { Providers } from './providers';

const font = localFont({
  src: '../styles/fonts/NotoSansSC-Regular.ttf',
  display: 'swap',
});

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en" className={font.className}>
      <body className="min-h-screen bg-background antialiased">
        <WebVitals />
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'light' }}>
          <div className="relative flex h-screen min-w-[1200px] flex-col">
            <main className="flex flex-1">{children}</main>
            {/*<Footer />*/}
          </div>
        </Providers>
      </body>
    </html>
  );
}
