import { getPostById } from '@/utils/getPostById';
import { getWikilinks } from '@/utils/getWikilinks';
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
  const wikilinks: string[] = await getWikilinks();

  const splits = wikilink.split('#');

  let post = null;
  const title = splits[0];
  const completeWikilink = wikilinks.find(
    l => l === title || l.includes(title),
  );
  if (completeWikilink) {
    const id = btoa(completeWikilink);
    post = await getPostById(id);
  }

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
        href={`/posts/${post?.id}`}
        color="foreground"
        as={NextLink}
        prefetch={false}
      >
        {children}
      </Link>
    </Tooltip>
  );
}
