'use client';

import { NextUIProvider } from '@nextui-org/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider className="min-h-full max-w-[1024px] mx-auto flex flex-col">
      {children}
    </NextUIProvider>
  );
}
