import Footer from '@components/Footer';
import { ReactNode } from 'react';
import './globals.css';

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
        <div className="w-full h-full">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
