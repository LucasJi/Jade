'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function Wikilink({
  wikilink = '',
  children,
  sourceNote,
}: {
  wikilink: string;
  children: ReactNode;
  sourceNote: string;
}) {
  // const note = null;

  const [simpleNoteName, ...noteParts] = wikilink.split('#');
  const source = simpleNoteName === '' ? sourceNote : simpleNoteName;

  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/note`);
  url.search = new URLSearchParams({
    name: source,
  }).toString();
  fetch(url, {
    method: 'GET',
    cache: 'force-cache',
  }).then(resp =>
    resp.json().then(data => console.log('wikilink note:', data)),
  );

  console.log(`source:${source}, wikilink:${wikilink}`, noteParts);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link
            className="text-obsidian"
            // href={`/notes/${encodeURIComponent(note!.id)}`}
            href={`/notes/TODO`}
            color="foreground"
            prefetch={false}
          >
            {children}
          </Link>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            {/*<Markdown*/}
            {/*  className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"*/}
            {/*  hast={{}}*/}
            {/*/>*/}
            {wikilink}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}
