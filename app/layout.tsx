import { Search } from '@/components/search';
import { SidebarLeft } from '@/components/sidebar-left';
import { SidebarRight } from '@/components/sidebar-right';
import SidebarRouter from '@/components/sidebar-router';
import { ThemeProvider } from '@/components/theme-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import WebVitals from '@/components/webVitals';
import { siteConfig } from '@/config/site';
import '@/styles/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Viewport } from 'next';
import localFont from 'next/font/local';
import { ReactNode } from 'react';

const font = localFont({
  src: '../styles/fonts/NotoSansSC-Regular.ttf',
  display: 'swap',
});

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: siteConfig.openGraph,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="en" className={font.className}>
      {process.env.NEXT_PUBLIC_GOOGLE_TAG_ID && (
        <GoogleAnalytics gaId={`${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}`} />
      )}
      <body className="min-h-screen bg-background antialiased">
        <WebVitals />
        <main>
          <ThemeProvider
            themeProps={{ attribute: 'class', defaultTheme: 'light' }}
          >
            <SidebarProvider>
              <SidebarLeft />
              <SidebarInset>
                <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background">
                  <div className="flex flex-1 items-center justify-between px-3">
                    <div className="flex flex-1 items-center gap-2">
                      <SidebarTrigger className="-ml-1" />
                      <SidebarRouter />
                    </div>
                    <div className="flex items-center gap-2">
                      <Search />
                    </div>
                  </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <ScrollArea
                    className="mx-auto flex h-[calc(100vh_-_5.5rem)] w-full max-w-3xl flex-col rounded-xl"
                    type="scroll"
                  >
                    {children}
                  </ScrollArea>
                </div>
              </SidebarInset>
              <SidebarRight />
            </SidebarProvider>
          </ThemeProvider>
        </main>
      </body>
    </html>
  );
}
