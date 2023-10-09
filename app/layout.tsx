import BlogNavbar from '@components/BlogNavbar';
import Footer from '@components/Footer';
import React from 'react';
import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Starry Blog',
  description: 'Display blogs written in Obsidian.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="light h-full" lang="en">
      <body className="h-full" suppressHydrationWarning={true}>
        <Providers>
          <BlogNavbar />
          <main className="flex-1 self-center">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
