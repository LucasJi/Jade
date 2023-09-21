import './globals.css';
import React from 'react';
import BlogNavbar from '@components/BlogNavbar';
import { Providers } from './providers';
import Footer from '@components/Footer';

export const metadata = {
  title: 'Starry Blog',
  description: 'Display blogs written in Obsidian.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="light" lang="en">
      <body>
        <Providers>
          <BlogNavbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
