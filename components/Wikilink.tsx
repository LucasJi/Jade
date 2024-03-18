'use client';

import Markdown from '@components/Markdown';
import {
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import { Post } from '@types';
import NextLink from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

export default function Wikilink({
  wikilink = '',
  children,
}: {
  wikilink: string | undefined;
  children: ReactNode;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/post`, {
      method: 'POST',
      body: JSON.stringify({ wikilink }),
    }).then(resp => resp.json().then(value => setPost(value)));
  }, [wikilink]);

  return (
    <Popover isOpen={open} onOpenChange={setOpen} placement="right-end">
      <PopoverTrigger
        onMouseEnter={() => {
          setOpen(true);
        }}
      >
        <Link href={`/${wikilink}`} color="foreground" as={NextLink}>
          {children}
        </Link>
      </PopoverTrigger>
      <PopoverContent className="p-4">
        <Markdown
          className="h-[400px] w-[600px] webkit-overflow-y-auto prose-sm"
          markdown={post?.content || ''}
        />
      </PopoverContent>
    </Popover>
  );
}
