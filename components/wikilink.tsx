'use client';

import Markdown from '@/components/markdown';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  const [noteNameFromWikilink, ...restWikilinkPart] = wikilink.split('#');
  let noteName = noteNameFromWikilink === '' ? origin : noteNameFromWikilink;
  noteName = noteNames.find(e => e.includes(noteName)) ?? '';

  const ext = getFileExt(noteName);
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hast, setHast] = useState<Nodes>();

  const handleOpenChange = (open: boolean) => {
    // TODO: Handle not markdown files
    if (open && ext !== 'pdf') {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/note`);
      url.search = new URLSearchParams({
        name: noteName,
      }).toString();
      fetch(url, {
        method: 'GET',
        // cache: 'force-cache',
      })
        .then(resp => resp.json())
        .then(data => {
          const { hast } = parseNote({
            note: data as string,
            plainNoteName: getFilenameWithoutExt(noteName),
          });
          setHast(hast);
          setNote(data);
          setIsLoading(false);
        });
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
        <HoverCardContent className="flex h-72 w-96">
          {isLoading ? (
            <LoadingSpinner className="mx-auto self-center" />
          ) : (
            <Markdown
              hast={hast!}
              origin={noteName}
              className="max-h-[620px] px-4"
              noteNames={noteNames}
            />
          )}
        </HoverCardContent>
      </Portal.Root>
    </HoverCard>
  );
}
