import { RK_ID_NOTE, RK_NOTE_PATH_ID } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis';
import { Note } from '@/types';
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

const redis = getRedisClient();

export default async function Wikilink({
  wikilink = '',
  children,
  currentNote,
}: {
  wikilink: string;
  children: ReactNode;
  currentNote: Note;
}) {
  console.log('component wikilink');
  let note = null;

  const splits = wikilink.split('#');
  const title = splits[0];

  if (title === '') {
    note = currentNote;
  } else {
    const matched = await redis.keys(`${RK_NOTE_PATH_ID}*${title}*`);
    console.log('wikilink', matched, title);
    if (matched.length > 0) {
      const path = matched[0];
      const id = await redis.get(path);
      console.log('wikilink id', id);

      if (id) {
        const noteStr = await redis.get(`${RK_ID_NOTE}${id}`);
        note = noteStr && (JSON.parse(noteStr) as Note);
      }
    }
  }

  if (note) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Link
              className="text-obsidian"
              href={`/notes/${encodeURIComponent(note!.id)}`}
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
                note={note!}
              />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className="text-obsidian">{children}</span>;
}
