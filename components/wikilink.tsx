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
import { getPostById, idPathMap } from '@/lib/server-utils';

export default async function Wikilink({
  wikilink = '',
  children,
  currentPost,
}: {
  wikilink: string;
  children: ReactNode;
  currentPost: Post;
}) {
  let post = null;

  const splits = wikilink.split('#');
  const title = splits[0];

  if (title === '') {
    post = currentPost;
  } else {
    const entries = idPathMap!.entries();
    for (const [id, path] of entries) {
      if (path === title || path.includes(title)) {
        post = await getPostById(id);
        break;
      }
    }
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
