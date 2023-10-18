import BlogNavbar from '@components/BlogNavbar';
import Footer from '@components/Footer';
import { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Starry Blog',
  description: 'Display blogs written in Obsidian.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html className="light h-full scroll-smooth" lang="en">
      <body className="h-full" suppressHydrationWarning={true}>
        <Providers>
          <BlogNavbar />
          <main className="w-full flex-1 self-center">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
