import { Post } from '@/types';
import { base64Decode } from '@/utils/common';
import { getPostById } from '@/utils/getPostById';
import { getPostIds } from '@/utils/getPostIds';
import { Tooltip } from '@nextui-org/tooltip';
import { Link } from '@nextui-org/link';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import Markdown from './Markdown';

export default async function Wikilink({
  wikilink = '',
  children,
  currentPost,
}: {
  wikilink: string;
  children: ReactNode;
  currentPost: Post;
}) {
  const postIds: string[] = await getPostIds();
  let post = null;

  const splits = wikilink.split('#');
  const title = splits[0];

  if (title === '') {
    post = currentPost;
  } else {
    const postId = postIds.find(id => {
      const path = base64Decode(id);
      return path === title || path.includes(title);
    });
    post = postId ? await getPostById(postId) : null;
  }

  if (post) {
    return (
      <Tooltip
        delay={200}
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
