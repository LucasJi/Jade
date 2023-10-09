'use client';

import Markdown from '@components/Markdown';
import {
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import httpClient from '@utils/axios';
import { AxiosResponse } from 'axios';
import React, { ReactNode, useEffect, useState } from 'react';
import { Post, Slug } from 'types';

const SEPARATOR = '/';

// TODO: should get post both from slug or wikilink
const convertWikilinkToSlug = (wikilink: string): Slug => {
  let postRelativePath = wikilink;
  if (wikilink.startsWith(SEPARATOR)) {
    postRelativePath = wikilink.replace(SEPARATOR, '');
  }
  return postRelativePath.split(SEPARATOR);
};

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
    httpClient
      .post('api/post', { slug: convertWikilinkToSlug(wikilink) })
      .then((res: AxiosResponse<Post>) => {
        if (res.data) {
          setPost(res.data);
        }
      });
  }, [wikilink]);

  return (
    <Popover isOpen={open} onOpenChange={setOpen} placement="right-end">
      <PopoverTrigger
        onMouseEnter={() => {
          setOpen(true);
        }}
      >
        <Link href={`/posts/${wikilink}`} color="foreground">
          {children}
        </Link>
      </PopoverTrigger>
      <PopoverContent>
        <Markdown
          className="h-[400px] w-[600px] webkit-overflow-y-auto"
          markdown={post?.content || ''}
        />
      </PopoverContent>
    </Popover>
  );
}
