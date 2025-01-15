'use client';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { FC } from 'react';

const ViewGraphButton: FC = () => {
  const router = useRouter();
  return (
    <Button
      className="h-7 w-7"
      variant="ghost"
      size="icon"
      title="View Graph"
      onClick={() => router.push('/')}
    >
      <Share2 size={16} />
      <span className="sr-only">View Graph</span>
    </Button>
  );
};

export default ViewGraphButton;
