'use client';

import { NextUIProvider } from '@nextui-org/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider className="min-h-screen relative max-w-[1024px] mx-auto">
      {children}
    </NextUIProvider>
  );
}
