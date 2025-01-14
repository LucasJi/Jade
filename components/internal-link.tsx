'use client';

import { getHastByPath } from '@/app/api';
import Markdown from '@/components/markdown';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExt, getFilename, mapInternalLinkToPath } from '@/lib/file';
import { encodeNotePath } from '@/lib/note';
import { noteParser } from '@/processor/parser';
import { truncateHast } from '@/processor/transformer/hast';
import * as Portal from '@radix-ui/react-portal';
import { Root } from 'hast';
import Link from 'next/link';
import { useState } from 'react';

export default function InternalLink({
  displayName,
  origin,
  notePaths,
  link,
}: {
  displayName: string;
  origin: string;
  notePaths: string[];
  link: string;
}) {
  const { notePath, subHeadings } = mapInternalLinkToPath(
    link,
    origin,
    notePaths,
  );
  const ext = getExt(notePath);
  const [isLoading, setIsLoading] = useState(true);
  const [hast, setHast] = useState<Root>();

  const handleOpenChange = (open: boolean) => {
    // TODO: Handle not markdown files and block link
    if (open && ext !== 'pdf' && !link.includes('#^')) {
      getHastByPath(notePath).then(data => {
        truncateHast(data, subHeadings);
        setHast(data);
        setIsLoading(false);
      });
    } else if (open) {
      const { hast } = noteParser({
        note: link.includes('#^')
          ? 'Block wikilink not supported yet'
          : 'Jade currently only supports markdown file preview',
        plainNoteName: getFilename(notePath),
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
          href={`/notes/${encodeNotePath(notePath)}`}
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
              <Markdown hast={hast!} origin={notePath} notePaths={notePaths} />
            </ScrollArea>
          )}
        </HoverCardContent>
      </Portal.Root>
    </HoverCard>
  );
}
