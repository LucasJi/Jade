'use client';

import { Link, Spinner, Tooltip } from '@nextui-org/react';
import { Post } from '@types';
import NextLink from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import Markdown from './Markdown';

export default function Wikilink({
  wikilink = '',
  children,
}: {
  wikilink: string;
  children: ReactNode;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
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
  }, [wikilink]);

  return (
    <Tooltip
      content={
        loading ? (
          <Spinner color="secondary" />
        ) : (
          <Markdown
            className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"
            markdown={post?.content || ''}
            title={post?.title || ''}
            renderWikilink={false}
            wikilink={wikilink}
          />
        )
      }
    >
      <Link
        className="text-[#A88BFA]"
        href={`/post/${post?.id}`}
        color="foreground"
        as={NextLink}
        prefetch={false}
      >
        {children}
      </Link>
    </Tooltip>
  );
}
