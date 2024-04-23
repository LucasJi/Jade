import { Link, Tooltip } from '@nextui-org/react';
import { getPostById, getWikilinks } from '@utils/postUtil';
import NextLink from 'next/link';
import { ReactNode } from 'react';
import Markdown from './Markdown';

export default function Wikilink({
  wikilink = '',
  children,
}: {
  wikilink: string;
  children: ReactNode;
}) {
  const wikilinks: string[] = getWikilinks();

  const splits = wikilink.split('#');

  let post = null;
  const title = splits[0];
  const completeWikilink = wikilinks.find(
    l => l === title || l.includes(title),
  );
  if (completeWikilink) {
    const id = btoa(completeWikilink);
    post = getPostById(id);
  }

  return (
    <Tooltip
      delay={500}
      content={
        <Markdown
          className="webkit-overflow-y-auto prose-sm h-[400px] w-[600px] p-4"
          markdown={post?.content || ''}
          title={post?.title || ''}
          renderWikilink={false}
          wikilink={wikilink}
        />
      }
    >
      <Link
        className="text-[#A88BFA]"
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
