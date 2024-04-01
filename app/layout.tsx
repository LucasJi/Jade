import Footer from '@components/Footer';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Galaxy Blog',
  description: 'Display posts written in Obsidian.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="light h-full w-full scroll-smooth m-0" lang="en">
      <body
        className="h-full w-full flex m-0 bg-[#E6DECE] min-h-[800px]"
        suppressHydrationWarning={true}
      >
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
