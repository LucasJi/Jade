import Footer from '@/components/footer';
import WebVitals from '@/components/webVitals';
import '@/styles/globals.css';
import { Noto_Sans_SC } from 'next/font/google';
import { ReactNode } from 'react';
import { Providers } from './providers';

// If loading a variable font, you don't need to specify the font weight
const font = Noto_Sans_SC({
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
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
