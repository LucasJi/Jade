import Link from 'next/link';
import { ReactNode } from 'react';
import Markdown from './markdown';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default async function Wikilink({
  wikilink = '',
  children,
  currentNote,
}: {
  wikilink: string;
  children: ReactNode;
  currentNote: string;
}) {
  // const note = null;

  const splits = wikilink.split('#');
  const title = splits[0];

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
            <Markdown
              className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"
              renderWikilink={false}
              wikilink={wikilink}
              note={currentNote}
            />
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}
