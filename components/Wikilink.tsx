'use client';

import {
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from '@nextui-org/react';
import NextLink from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import Markdown from './Markdown';
import { Post } from '@types';

export default function Wikilink({
  wikilink = '',
  children,
}: {
  wikilink: string | undefined;
  children: ReactNode;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    if (open) {
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/post?${new URLSearchParams({
          wikilink,
        })}`,
        {
          method: 'GET',
        },
      )
        .then(resp => resp.json())
        .then(value => setPost(value))
        .then(() => setLoading(false));
    }
  }, [open]);

  return (
    <Popover isOpen={open} onOpenChange={setOpen} placement="right-end">
      <PopoverTrigger
        onMouseEnter={() => {
          setOpen(true);
        }}
      >
        <Link
          href={`/post/${post?.id}`}
          color="foreground"
          as={NextLink}
          prefetch={false}
        >
          {children}
        </Link>
      </PopoverTrigger>
      <PopoverContent className="p-4 h-[400px] w-[600px]">
        {loading ? (
          <Spinner color="secondary" />
        ) : (
          <Markdown
            className="webkit-overflow-y-auto prose-sm"
            markdown={post?.content || ''}
            renderWikilink={false}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
