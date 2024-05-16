import { base64Decode } from '@/utils/common';
import { getPostById } from '@/utils/getPostById';
import { getPostIds } from '@/utils/getPostIds';
import { Link, Tooltip } from '@nextui-org/react';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import Markdown from './Markdown';

export default async function Wikilink({
  wikilink = '',
  children,
}: {
  wikilink: string;
  children: ReactNode;
}) {
  const postIds: string[] = await getPostIds();
  let post = null;

  const splits = wikilink.split('#');
  const title = splits[0];
  const postId = postIds.find(id => {
    const path = base64Decode(id);
    return path === title || path.includes(title);
  });
  if (postId) {
    post = await getPostById(postId);
    return (
      <Tooltip
        delay={500}
        content={
          <Markdown
            className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"
            renderWikilink={false}
            wikilink={wikilink}
            post={post!}
          />
        }
      >
        <Link
          className="text-obsidian-purple"
          href={`/posts/${encodeURIComponent(post!.id)}`}
          color="foreground"
          as={NextLink}
          prefetch={false}
        >
          {children}
        </Link>
      </Tooltip>
    );
  }

  return <span className="text-obsidian-purple">{children}</span>;
}
