'use client';

import { getNoteByName } from '@/app/api';
import Markdown from '@/components/markdown';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExt, getFilename } from '@/lib/file';
import { encodeNotePath } from '@/lib/note';
import { parseNote } from '@/processor/parser';
import * as Portal from '@radix-ui/react-portal';
import { Nodes } from 'hast';
import Link from 'next/link';
import { useState } from 'react';

export default function InternalLink({
  displayName,
  origin,
  noteNames,
  link,
}: {
  displayName: string;
  origin: string;
  noteNames: string[];
  link: string;
}) {
  const [noteNameFromLink, ...subHeadings] = link.split('#');
  let noteName = noteNameFromLink === '' ? origin : noteNameFromLink;
  noteName = noteNames.find(e => e.includes(noteName)) ?? '';
  const ext = getExt(noteName);
  const [isLoading, setIsLoading] = useState(true);
  const [hast, setHast] = useState<Nodes>();

  const handleOpenChange = (open: boolean) => {
    // TODO: Handle not markdown files and block link
    if (open && ext !== 'pdf' && !link.includes('#^')) {
      getNoteByName(noteName).then(data => {
        const { hast } = parseNote({
          note: data as string,
          plainNoteName: getFilename(noteName),
          subHeadings,
        });
        setHast(hast);
        setIsLoading(false);
      });
    } else if (open) {
      const { hast } = parseNote({
        note: link.includes('#^')
          ? 'Block wikilink not supported yet'
          : 'Jade currently only supports markdown file preview',
        plainNoteName: getFilename(noteName),
        subHeadings,
      });
      setHast(hast);
      setIsLoading(false);
    }
  };

  return (
    <HoverCard onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        <Link
          className="text-obsidian"
          href={`/notes/${encodeNotePath(noteName)}`}
          color="foreground"
          prefetch={false}
        >
          {displayName}
        </Link>
      </HoverCardTrigger>
      <Portal.Root>
        <HoverCardContent className="flex h-[400px] w-[768px] px-4">
          {isLoading ? (
            <LoadingSpinner className="mx-auto self-center" />
          ) : (
            <ScrollArea type="scroll">
              <Markdown hast={hast!} origin={noteName} noteNames={noteNames} />
            </ScrollArea>
          )}
        </HoverCardContent>
      </Portal.Root>
    </HoverCard>
  );
}
