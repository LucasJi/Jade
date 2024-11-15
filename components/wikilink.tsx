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
}: {
  wikilink: string;
  children: ReactNode;
}) {
  // const note = null;

  const splits = wikilink.split('#');
  const title = splits[0];
  console.log(wikilink);

  // if (title === '') {
  //   note = currentNote;
  // } else {
  //   const matched = await redis.keys(`${RK_NOTE_PATH_ID}*${title}*`);
  //   if (matched.length > 0) {
  //     const path = matched[0];
  //     const id = await redis.get(path);
  //
  //     if (id) {
  //       const noteStr = await redis.get(`${RK_ID_NOTE}${id}`);
  //       note = noteStr && (JSON.parse(noteStr) as Note);
  //     }
  //   }
  // }

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
