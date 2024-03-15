import Markdown from '@components/Markdown';
import {
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import { convertWikilinkToSlug } from '@utils/postUtil';
import NextLink from 'next/link';
import { ReactNode } from 'react';

export default async function Wikilink({
  wikilink = '',
  children,
}: {
  wikilink: string | undefined;
  children: ReactNode;
}) {
  const postResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/post`, {
    method: 'POST',
    body: JSON.stringify({ slug: convertWikilinkToSlug(wikilink) }),
  });

  const post = await postResp.json();

  return (
    <Popover placement="right-end">
      <PopoverTrigger>
        <Link href={`/posts/${wikilink}`} color="foreground" as={NextLink}>
          {children}
        </Link>
      </PopoverTrigger>
      <PopoverContent>
        <Markdown
          className="h-[400px] w-[600px] webkit-overflow-y-auto"
          markdown={post?.content || ''}
          enableWikilink={false}
        />
      </PopoverContent>
    </Popover>
  );
}
