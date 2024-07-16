// import WebVitals from '@/components/webVitals';
import Footer from '@/components/footer';
import { ReactNode } from 'react';
import './globals.css';
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
          <div className="relative flex flex-col h-screen">
            <main className="flex flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
