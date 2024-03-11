'use client';

import { NextUIProvider } from '@nextui-org/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider className="w-full h-full m-0 flex flex-col">
      {children}
    </NextUIProvider>
  );
}
