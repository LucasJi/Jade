import './globals.css';
import React from 'react';
import BlogNavbar from '@components/BlogNavbar';
import { Providers } from './providers';
import Footer from '@components/Footer';

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
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
