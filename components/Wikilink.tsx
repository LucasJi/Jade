'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import httpClient from '@utils/axios';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { AxiosResponse } from 'axios';
import { Post, Slug } from 'types';
import wikilinkPlugin from '@utils/remark-wikilink';
import remarkGfm from 'remark-gfm';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';

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
  onClick,
}: {
  wikilink: string | undefined;
  onClick: (post: Post) => void;
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // prevent displaying content by clicking the button
    // only display the content by mouse enter event
    e.preventDefault();
    if (post !== null) {
      onClick(post);
    }
  };

  return (
    <Popover
      isOpen={open}
      onOpenChange={setOpen}
      placement="right-end"
      shouldCloseOnBlur
      style={{
        overflowX: 'auto',
        maxHeight: '300px',
      }}
    >
      <PopoverTrigger
        onMouseEnter={() => {
          setOpen(true);
        }}
      >
        <button onClick={e => handleClick(e)}>{children}</button>
      </PopoverTrigger>
      <PopoverContent className="overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm, wikilinkPlugin]}>
          {post?.content || ''}
        </ReactMarkdown>
      </PopoverContent>
    </Popover>
  );
}
