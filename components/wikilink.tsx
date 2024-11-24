'use client';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { encodeNoteName } from '@/lib/note';
import { getFileExt } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function Wikilink({
  target,
  displayName,
  restWikilinkPart = [],
  source,
}: {
  target: string;
  displayName: string;
  restWikilinkPart: string[];
  source: string;
}) {
  const ext = getFileExt(source);
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenChange = (open: boolean) => {
    // TODO: Handle not markdown files
    if (open && ext !== 'pdf') {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/note`);
      url.search = new URLSearchParams({
        name: source,
      }).toString();
      fetch(url, {
        method: 'GET',
        // cache: 'force-cache',
      })
        .then(resp => resp.json())
        .then(data => {
          setNote(data);
          setIsLoading(false);
        });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip onOpenChange={handleOpenChange}>
        <TooltipTrigger>
          <Link
            className="text-obsidian"
            href={`/notes/${encodeNoteName(target)}`}
            color="foreground"
            prefetch={false}
          >
            {displayName}
          </Link>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent className="flex h-72 w-96">
            {isLoading ? (
              <LoadingSpinner className="mx-auto self-center" />
            ) : (
              note
            )}
            {/*<Markdown*/}
            {/*  className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"*/}
            {/*  hast={{}}*/}
            {/*/>*/}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}
