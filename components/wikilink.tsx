import { POST_ID, POST_PATH } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis-utils';
import { Post } from '@/types';
import Link from 'next/link';
import { ReactNode } from 'react';
import Markdown from './markdown';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const redis = getRedisClient();

export default async function Wikilink({
  wikilink = '',
  children,
  currentPost,
}: {
  wikilink: string;
  children: ReactNode;
  currentPost: Post;
}) {
  console.log('component wikilink');
  let post = null;

  const splits = wikilink.split('#');
  const title = splits[0];

  if (title === '') {
    post = currentPost;
  } else {
    const matched = await redis.keys(`${POST_PATH}*${title}*`);
    console.log('wikilink', matched, title);
    if (matched.length > 0) {
      const path = matched[0];
      const id = await redis.get(path);
      console.log('wikilink id', id);

      if (id) {
        const postStr = await redis.get(`${POST_ID}${id}`);
        post = postStr && (JSON.parse(postStr) as Post);
      }
    }
  }

  if (post) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Link
              className="text-obsidian"
              href={`/posts/${encodeURIComponent(post!.id)}`}
              color="foreground"
              prefetch={false}
            >
              {children}
            </Link>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              <Markdown
                className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"
                renderWikilink={false}
                wikilink={wikilink}
                post={post!}
              />
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className="text-obsidian">{children}</span>;
}
