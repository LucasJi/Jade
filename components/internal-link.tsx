'use client';

import { getHastByPath } from '@/app/api';
import { useIsMobile } from '@/components/hooks/use-mobile';
import Markdown from '@/components/markdown';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExt, getFilename, mapInternalLinkToVaultPath } from '@/lib/file';
import { getRoutePathFromVaultPath } from '@/lib/note';
import { noteParser } from '@/processor/parser';
import { truncateHast } from '@/processor/transformer/hast';
import * as Portal from '@radix-ui/react-portal';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Root } from 'hast';
import Link from 'next/link';
import { useState } from 'react';

export default function InternalLink({
  displayName,
  origin,
  vaultPaths,
  link,
}: {
  displayName: string;
  origin: string;
  vaultPaths: string[];
  link: string;
}) {
  const { vaultPath, subHeadings } = mapInternalLinkToVaultPath(
    link,
    origin,
    vaultPaths,
  );
  const ext = getExt(vaultPath);
  const [isLoading, setIsLoading] = useState(true);
  const [hast, setHast] = useState<Root>();
  const isMobile = useIsMobile();

  const handleOpenChange = (open: boolean) => {
    // TODO: Handle not markdown files and block link
    if (open && ext !== 'pdf' && !link.includes('#^')) {
      getHastByPath(vaultPath).then(data => {
        truncateHast(data, subHeadings);
        console.log(link, vaultPath, subHeadings, data);
        setHast(data);
        setIsLoading(false);
      });
    } else if (open) {
      const { hast } = noteParser({
        note: link.includes('#^')
          ? 'Block wikilink not supported yet'
          : 'Jade currently only supports markdown file preview',
        plainNoteName: getFilename(vaultPath),
      });
      setHast(hast);
      setIsLoading(false);
    }
  };

  if (isMobile) {
    return (
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-obsidian"
            asChild
            style={{
              padding: 'unset',
              height: 'unset',
              fontSize: 'unset',
              lineHeight: 'unset',
            }}
          >
            <span>{displayName}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="flex h-2/3 flex-col px-4">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>{`Wiki style internal link to ${displayName}`}</DialogTitle>
            </VisuallyHidden>
            <DialogDescription>
              <Link
                className="flex items-center underline"
                href={`/notes/${getRoutePathFromVaultPath(vaultPath)}`}
                prefetch={false}
              >
                <span className="text-sm">Navigate to this note</span>
              </Link>
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <LoadingSpinner className="mx-auto self-center" />
          ) : (
            <ScrollArea type="scroll">
              <Markdown
                hast={hast!}
                origin={vaultPath}
                vaultPaths={vaultPaths}
              />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <HoverCard onOpenChange={handleOpenChange}>
      <HoverCardTrigger asChild>
        <Link
          className="text-obsidian"
          href={`/notes/${getRoutePathFromVaultPath(vaultPath)}`}
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
              <Markdown
                hast={hast!}
                origin={vaultPath}
                vaultPaths={vaultPaths}
              />
            </ScrollArea>
          )}
        </HoverCardContent>
      </Portal.Root>
    </HoverCard>
  );
}
