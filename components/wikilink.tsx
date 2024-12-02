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
import { encodeNoteName } from '@/lib/note';
import { getFileExt, getFilenameWithoutExt } from '@/lib/utils';
import { parseNote } from '@/processor/parser';
import * as Portal from '@radix-ui/react-portal';
import { Nodes } from 'hast';
import Link from 'next/link';
import { useState } from 'react';

export default function Wikilink({
  displayName,
  origin,
  noteNames,
  wikilink,
}: {
  displayName: string;
  origin: string;
  noteNames: string[];
  wikilink: string;
}) {
  const [noteNameFromWikilink, ...subHeadings] = wikilink.split('#');
  let noteName = noteNameFromWikilink === '' ? origin : noteNameFromWikilink;
  noteName = noteNames.find(e => e.includes(noteName)) ?? '';
  const ext = getFileExt(noteName);
  const [isLoading, setIsLoading] = useState(true);
  const [hast, setHast] = useState<Nodes>();

  const handleOpenChange = (open: boolean) => {
    // TODO: Handle not markdown files and block wikilink
    if (open && ext !== 'pdf' && !wikilink.includes('#^')) {
      getNoteByName(noteName).then(data => {
        const { hast } = parseNote({
          note: data as string,
          plainNoteName: getFilenameWithoutExt(noteName),
          subHeadings,
        });
        setHast(hast);
        setIsLoading(false);
      });
    } else if (open) {
      const { hast } = parseNote({
        note: wikilink.includes('#^')
          ? 'Block wikilink not supported yet'
          : 'Jade currently only supports markdown file preview',
        plainNoteName: getFilenameWithoutExt(noteName),
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
          href={`/notes/${encodeNoteName(noteName)}`}
          color="foreground"
          prefetch={false}
        >
          {displayName}
        </Link>
      </HoverCardTrigger>
      <Portal.Root>
        <HoverCardContent className="flex h-[400px] w-[600px] px-4">
          {isLoading ? (
            <LoadingSpinner className="mx-auto self-center" />
          ) : (
            <ScrollArea>
              <Markdown hast={hast!} origin={noteName} noteNames={noteNames} />
            </ScrollArea>
          )}
        </HoverCardContent>
      </Portal.Root>
    </HoverCard>
  );
}
