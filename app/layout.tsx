// import WebVitals from '@/components/webVitals';
import Footer from '@/components/footer';
import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className="min-h-screen bg-background antialiased">
        {/*<WebVitals />*/}
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
