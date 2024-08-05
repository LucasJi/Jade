import { Post } from '@/types';
import Link from 'next/link';
import { ReactNode } from 'react';
import Markdown from './markdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { base64Decode, getPostById, getPostIds } from '@/lib/server-utils';

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Link
              className="text-obsidian-purple"
              href={`/posts/${encodeURIComponent(post!.id)}`}
              color="foreground"
              // as={NextLink}
              prefetch={false}
            >
              {children}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <Markdown
              className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"
              renderWikilink={false}
              wikilink={wikilink}
              post={post!}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className="text-obsidian-purple">{children}</span>;
}
