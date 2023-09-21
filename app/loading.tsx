'use client';

import { Spinner } from '@nextui-org/react';
import React from 'react';

export default function Loading() {
  return (
    <Spinner
      className="absolute top-[calc((100%_-_2.5rem)_/_2)] left-[calc((100%_-_2.5rem)_/_2)]"
      color="primary"
      size="lg"
    />
  );
}
